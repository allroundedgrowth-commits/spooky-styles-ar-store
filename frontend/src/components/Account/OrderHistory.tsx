import React, { useEffect, useState } from 'react';
import orderService from '../../services/order.service';
import { Order } from '../../types/order';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await orderService.getOrderHistory();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'processing':
        return 'text-blue-400 bg-blue-900/30';
      case 'shipped':
        return 'text-purple-400 bg-purple-900/30';
      case 'delivered':
        return 'text-green-400 bg-green-900/30';
      case 'cancelled':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-halloween-orange mb-4"></div>
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <p className="text-red-300">{error}</p>
        <button
          onClick={loadOrders}
          className="mt-4 text-halloween-orange hover:text-orange-400 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-halloween-dark rounded-lg border border-halloween-purple/30">
        <p className="text-gray-400 text-lg mb-4">No orders yet</p>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
        <a
          href="/products"
          className="inline-block bg-halloween-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-halloween-orange mb-6">Order History</h3>
      
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-halloween-dark border border-halloween-purple/30 rounded-lg p-6 hover:border-halloween-purple/50 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="text-white font-mono text-sm">{order.id.substring(0, 8)}...</p>
            </div>
            
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-gray-400">Date</p>
              <p className="text-white">{formatDate(order.created_at)}</p>
            </div>
            
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-halloween-orange font-bold text-lg">
                ${order.total.toFixed(2)}
              </p>
            </div>
            
            <div className="mt-2 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <a
              href={`/orders/${order.id}`}
              className="text-halloween-purple hover:text-purple-400 text-sm font-medium"
            >
              View Details →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
