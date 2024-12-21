// src/lib/context/NotificationsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { 
  Notification, 
  NotificationsContextType 
} from '../types/core-types';

const NotificationsContext = createContext<NotificationsContextType | null>(null);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps): JSX.Element {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unviewedCount, setUnviewedCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupNotificationsListener = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setUnviewedCount(0);
        return;
      }

      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Notification[];

            setNotifications(newNotifications);
            
            const unreadCount = newNotifications.filter(n => !n.read).length;
            const unviewedCount = newNotifications.filter(n => !n.viewed).length;
            
            setUnreadCount(unreadCount);
            setUnviewedCount(unviewedCount);
          },
          (error) => {
            console.error('Error in notifications listener:', error);
            setError(error.message);
          }
        );

        const initialSnapshot = await getDocs(q);
        const initialNotifications = initialSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp ? 
            doc.data().createdAt.toDate() : 
            new Date()
        })) as Notification[];
        
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter(n => !n.read).length);
        setUnviewedCount(initialNotifications.filter(n => !n.viewed).length);
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    setupNotificationsListener();
    return () => unsubscribe();
  }, [user]);

  const contextValue: NotificationsContextType = {
    notifications,
    unreadCount,
    unviewedCount,
    setUnviewedCount,
    error,
    markAsRead: async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    markAllAsRead: async () => {
      if (!user) return;
      try {
        await notificationService.markAllAsRead(user.uid);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
    markNotificationsAsViewed: async () => {
      if (!user) return;
      try {
        await notificationService.markNotificationsAsViewed(user.uid);
      } catch (error) {
        console.error('Error marking notifications as viewed:', error);
      }
    }
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}