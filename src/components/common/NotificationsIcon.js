"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../lib/context/NotificationsContext';
import { useAuth } from '../../lib/context/AuthContext';

function formatTimeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default function NotificationsIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unviewedCount,
    setUnviewedCount, 
    markAsRead, 
    markAllAsRead,
    markNotificationsAsViewed 
  } = useNotifications();
  const { user } = useAuth();

  const handleToggle = useCallback(async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // If we're opening the dropdown and there are unviewed notifications
    if (newIsOpen && unviewedCount > 0) {
      // Update local state immediately
      setUnviewedCount(0);
      // Then update the database
      await markNotificationsAsViewed();
    }
  }, [isOpen, unviewedCount, setUnviewedCount, markNotificationsAsViewed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('notifications-dropdown');
      if (dropdown && !dropdown.contains(event.target) && 
          !event.target.closest('button[aria-label="Toggle notifications"]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label="Toggle notifications"
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unviewedCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unviewedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          id="notifications-dropdown"
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50"
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mb-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatTimeAgo(notification.createdAt)}</span>
                    {!notification.read && (
                      <span className="text-blue-500">New</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}