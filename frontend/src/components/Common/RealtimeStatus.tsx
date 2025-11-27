/**
 * Realtime Status Component
 * 
 * Displays the current connection status for Supabase Realtime subscriptions.
 * Shows connected, disconnected, or reconnecting states with visual indicators.
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { realtimeConnectionManager } from '../../services/realtime-connection-manager';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface RealtimeStatusProps {
  /** Position of the status indicator */
  position?: 'header' | 'footer' | 'fixed';
  /** Show detailed connection info on hover */
  showDetails?: boolean;
  /** Custom className for styling */
  className?: string;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  position = 'header',
  showDetails = true,
  className = '',
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [showTooltip, setShowTooltip] = useState(false);
  const [stats, setStats] = useState({
    totalChannels: 0,
    totalSubscribers: 0,
  });

  useEffect(() => {
    // Initial status check
    updateStatus();

    // Listen for Realtime notifications
    const handleNotification = (event: CustomEvent) => {
      const { message } = event.detail;
      
      if (message.includes('Connected') || message.includes('subscribed')) {
        setStatus('connected');
      } else if (message.includes('Reconnecting') || message.includes('lost')) {
        setStatus('reconnecting');
      } else if (message.includes('closed') || message.includes('error')) {
        setStatus('disconnected');
      }
    };

    // Listen for auth refresh events
    const handleAuthRefresh = () => {
      setStatus('reconnecting');
      setTimeout(() => updateStatus(), 2000);
    };

    window.addEventListener('realtime-notification', handleNotification as EventListener);
    window.addEventListener('realtime-auth-refresh', handleAuthRefresh);

    // Poll for status updates
    const interval = setInterval(() => {
      updateStatus();
    }, 5000);

    return () => {
      window.removeEventListener('realtime-notification', handleNotification as EventListener);
      window.removeEventListener('realtime-auth-refresh', handleAuthRefresh);
      clearInterval(interval);
    };
  }, []);

  const updateStatus = () => {
    const connectionStats = realtimeConnectionManager.getStats();
    setStats(connectionStats);

    // Determine status based on active channels
    if (connectionStats.totalChannels > 0 && connectionStats.totalSubscribers > 0) {
      setStatus('connected');
    } else if (connectionStats.totalChannels > 0 && connectionStats.totalSubscribers === 0) {
      setStatus('reconnecting');
    } else {
      setStatus('disconnected');
    }
  };

  const handleReconnect = async () => {
    setStatus('reconnecting');
    try {
      await realtimeConnectionManager.reconnectAll();
      setTimeout(() => updateStatus(), 1000);
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setStatus('disconnected');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-halloween-green',
          bgColor: 'bg-halloween-green/10',
          label: 'Connected',
          description: 'Real-time updates active',
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          color: 'text-halloween-orange',
          bgColor: 'bg-halloween-orange/10',
          label: 'Reconnecting',
          description: 'Attempting to reconnect...',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Disconnected',
          description: 'Real-time updates unavailable',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Position-specific styles
  const positionStyles = {
    header: 'relative',
    footer: 'relative',
    fixed: 'fixed bottom-4 right-4 z-50',
  };

  return (
    <div
      className={`${positionStyles[position]} ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status Indicator */}
      <button
        onClick={status === 'disconnected' ? handleReconnect : undefined}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          ${config.bgColor} ${config.color}
          transition-all duration-200
          ${status === 'disconnected' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        `}
        title={config.description}
      >
        <Icon
          className={`w-4 h-4 ${status === 'reconnecting' ? 'animate-spin' : ''}`}
        />
        <span className="text-xs font-medium hidden sm:inline">
          {config.label}
        </span>
      </button>

      {/* Detailed Tooltip */}
      {showDetails && showTooltip && (
        <div
          className="
            absolute top-full mt-2 right-0
            bg-halloween-darkPurple border border-halloween-purple/30
            rounded-lg shadow-lg p-3 min-w-[200px]
            z-50
          "
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Status:</span>
              <span className={`text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Channels:</span>
              <span className="text-xs text-white">
                {stats.totalChannels}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Subscribers:</span>
              <span className="text-xs text-white">
                {stats.totalSubscribers}
              </span>
            </div>

            {status === 'disconnected' && (
              <button
                onClick={handleReconnect}
                className="
                  w-full mt-2 px-3 py-1.5 rounded
                  bg-halloween-purple hover:bg-halloween-purple/80
                  text-white text-xs font-medium
                  transition-colors duration-200
                "
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;
