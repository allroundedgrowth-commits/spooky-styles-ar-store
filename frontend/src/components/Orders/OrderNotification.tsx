import React, { useEffect, useState } from 'react';
import { X, Package, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import type { OrderNotification as OrderNotificationType } from '../../hooks/useRealtimeOrders';

/**
 * Props for OrderNotification component
 */
interface OrderNotificationProps {
  notification: OrderNotificationType;
  onDismiss: (orderId: string) => void;
  autoHideDuration?: number; // milliseconds, default 5000
}

/**
 * Get icon and color based on order status
 */
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        icon: Package,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
      };
    case 'processing':
      return {
        icon: Package,
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
      };
    case 'shipped':
      return {
        icon: Truck,
        color: 'bg-halloween-purple',
        textColor: 'text-halloween-purple',
      };
    case 'delivered':
      return {
        icon: CheckCircle,
        color: 'bg-halloween-green',
        textColor: 'text-halloween-green',
      };
    case 'cancelled':
      return {
        icon: AlertCircle,
        color: 'bg-red-500',
        textColor: 'text-red-500',
      };
    default:
      return {
        icon: Package,
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
      };
  }
};

/**
 * OrderNotification Component
 * 
 * Displays toast notifications for order status changes.
 * Auto-dismisses after 5 seconds by default.
 * 
 * Requirements: 3.1
 * 
 * @example
 * ```tsx
 * <OrderNotification
 *   notification={{
 *     orderId: 'order-123',
 *     newStatus: 'shipped',
 *     timestamp: '2024-01-01T12:00:00Z',
 *     message: 'Order #order-123 is now shipped'
 *   }}
 *   onDismiss={(id) => console.log('Dismissed', id)}
 * />
 * ```
 */
export const OrderNotification: React.FC<OrderNotificationProps> = ({
  notification,
  onDismiss,
  autoHideDuration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const statusDisplay = getStatusDisplay(notification.newStatus);
  const StatusIcon = statusDisplay.icon;

  /**
   * Auto-dismiss after specified duration
   * Requirement 3.1: Auto-dismiss after 5 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle dismiss with animation
   */
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(notification.orderId);
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        bg-white dark:bg-halloween-black
        border-2 border-halloween-purple
        rounded-lg shadow-2xl
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className={`flex-shrink-0 ${statusDisplay.color} rounded-full p-2`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Order Status Update
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>
            {notification.oldStatus && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Changed from{' '}
                <span className="font-medium">{notification.oldStatus}</span> to{' '}
                <span className={`font-medium ${statusDisplay.textColor}`}>
                  {notification.newStatus}
                </span>
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              transition-colors
            "
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${statusDisplay.color} transition-all ease-linear`}
            style={{
              animation: `shrink ${autoHideDuration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * OrderNotificationContainer Component
 * 
 * Container for managing multiple order notifications.
 * Stacks notifications vertically with proper spacing.
 * 
 * @example
 * ```tsx
 * <OrderNotificationContainer
 *   notifications={notifications}
 *   onDismiss={(id) => removeNotification(id)}
 * />
 * ```
 */
interface OrderNotificationContainerProps {
  notifications: OrderNotificationType[];
  onDismiss: (orderId: string) => void;
  autoHideDuration?: number;
}

export const OrderNotificationContainer: React.FC<
  OrderNotificationContainerProps
> = ({ notifications, onDismiss, autoHideDuration = 5000 }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={`${notification.orderId}-${notification.timestamp}`}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 10}px)`,
          }}
        >
          <OrderNotification
            notification={notification}
            onDismiss={onDismiss}
            autoHideDuration={autoHideDuration}
          />
        </div>
      ))}
    </div>
  );
};

export default OrderNotification;
