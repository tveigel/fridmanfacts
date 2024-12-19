// src/lib/services/notificationService.ts
import { 
  collection, 
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { NotificationType } from '../types/types';

type CreateNotificationParams = {
  userId: string;
  factCheckId: string;
  message: string;
  type: NotificationType;
};

export const notificationService = {
  async createNotification({ userId, factCheckId, message, type }: CreateNotificationParams) {
    try {
      const notificationData = {
        userId,
        factCheckId,
        message,
        type,
        read: false,
        viewed: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getNotificationsForUser(userId: string) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? 
          doc.data().createdAt.toDate() : 
          new Date()
      }));

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationSnap = await getDoc(notificationRef);
      
      if (!notificationSnap.exists()) {
        throw new Error('Notification not found');
      }

      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getNotificationsForUser(userId);
      const unreadNotifications = notifications.filter(n => !n.read);

      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async markNotificationsAsViewed(userId: string) {
    try {
      const notifications = await this.getNotificationsForUser(userId);
      const unviewedNotifications = notifications.filter(n => !n.viewed);

      if (unviewedNotifications.length === 0) return;

      const batch = writeBatch(db);
      unviewedNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          viewed: true,
          viewedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as viewed:', error);
      throw error;
    }
  }
};