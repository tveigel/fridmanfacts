// lib/context/__tests__/NotificationsContext.test.js
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationsProvider, useNotifications } from '../NotificationsContext';
import { useAuth } from '../AuthContext';
import { notificationService } from '../../services/notificationService';

// Mock dependencies
jest.mock('../AuthContext');
jest.mock('../../services/notificationService');

// Mock component to test the hook
const TestComponent = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <button onClick={() => markAsRead('test-id')}>Mark Read</button>
      <button onClick={markAllAsRead}>Mark All Read</button>
    </div>
  );
};

describe('NotificationsContext', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Auth Context
    useAuth.mockReturnValue({
      user: { uid: 'test-user-id' }
    });

    // Mock notification service
    notificationService.getNotificationsForUser.mockResolvedValue([
      {
        id: 'notification1',
        read: false,
        message: 'Test notification 1',
        createdAt: new Date()
      },
      {
        id: 'notification2',
        read: true,
        message: 'Test notification 2',
        createdAt: new Date()
      }
    ]);
  });

  it('provides notifications and unread count', async () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });
  });

  it('marks a notification as read', async () => {
    notificationService.markAsRead.mockResolvedValue();

    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      screen.getByText('Mark Read').click();
    });

    expect(notificationService.markAsRead).toHaveBeenCalledWith('test-id');
  });

  it('marks all notifications as read', async () => {
    notificationService.markAllAsRead.mockResolvedValue();

    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      screen.getByText('Mark All Read').click();
    });

    expect(notificationService.markAllAsRead).toHaveBeenCalledWith('test-user-id');
  });

  it('handles error in fetching notifications', async () => {
    // Mock error
    const error = new Error('Failed to fetch notifications');
    notificationService.getNotificationsForUser.mockRejectedValue(error);
    
    console.error = jest.fn(); // Mock console.error

    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error setting up notifications:', error);
    });
  });

  it('clears notifications when user logs out', async () => {
    const { rerender } = render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
    });

    // Simulate logout
    useAuth.mockReturnValue({ user: null });

    rerender(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });
});