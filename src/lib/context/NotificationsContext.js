"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupNotificationsListener = async () => {
      if (!user) {
        console.log('No user logged in, clearing notifications state');
        setNotifications([]);
        setUnreadCount(0);
        setUnviewedCount(0);
        return;
      }

      console.log('Setting up notifications listener for user:', user.uid);

      try {
        // Set up real-time listener
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            console.log(`Received notification update, ${snapshot.docs.length} notifications`);
            
            const newNotifications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            }));

            setNotifications(newNotifications);
            
            const unreadCount = newNotifications.filter(n => !n.read).length;
            const unviewedCount = newNotifications.filter(n => !n.viewed).length;
            
            console.log('Updated notification counts:', { unreadCount, unviewedCount });
            
            setUnreadCount(unreadCount);
            setUnviewedCount(unviewedCount);
          },
          (error) => {
            console.error('Error in notifications listener:', error);
            setError(error.message);
          }
        );

        // Get initial notifications
        const initialSnapshot = await getDocs(q);
        const initialNotifications = initialSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        console.log(`Loaded ${initialNotifications.length} initial notifications`);
        
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter(n => !n.read).length);
        setUnviewedCount(initialNotifications.filter(n => !n.viewed).length);
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setError(error.message);
      }
    };

    setupNotificationsListener();
    return () => unsubscribe();
  }, [user]);

  const contextValue = {
    notifications,
    unreadCount,
    unviewedCount,
    setUnviewedCount,
    error,
    markAsRead: async (notificationId) => {
      console.log('Marking notification as read:', notificationId);
      try {
        await notificationService.markAsRead(notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    markAllAsRead: async () => {
      console.log('Marking all notifications as read');
      if (!user) return;
      try {
        await notificationService.markAllAsRead(user.uid);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
    markNotificationsAsViewed: async () => {
      console.log('Marking notifications as viewed');
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

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};