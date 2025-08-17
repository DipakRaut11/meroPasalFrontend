// src/pages/ShopkeeperDashboard/ShopkeeperOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { getShopOrders, updateOrderStatus } from '../../api/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ShopkeeperOrdersPage = () => {
  const token = sessionStorage.getItem('token');
  const [orders, setOrders] = useState([]); // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  try {
    setLoading(true);
    const res = await getShopOrders(token);
    console.log('Orders API response:', res); // should log the array you posted
    setOrders(Array.isArray(res) ? res : []); // use res directly
  } catch (err) {
    console.error(err);
    setError('Failed to fetch orders');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};



  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status, token);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) return <p>{error}</p>;

  return (
    <div className="shopkeeper-orders">
      <h2>Order Management</h2>
      {(orders || []).length === 0 ? (
        <p>No orders found for your shop.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userName || order.userId}</td>
                <td>
                  {(order.items || []).map(item => (
                    <div key={item.productId}>
                      {item.productName} x {item.quantity}
                    </div>
                  ))}
                </td>
                <td>{order.totalAmount}</td>
                <td>{order.orderStatus}</td>
                <td>
                  <select
                    value={order.orderStatus || 'PENDING'}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShopkeeperOrdersPage;
