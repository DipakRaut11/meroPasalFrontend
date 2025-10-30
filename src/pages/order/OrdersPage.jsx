import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const API_PREFIX = '/api/v1'; // proxy enabled

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_PREFIX}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || 'Failed to fetch orders');
          return;
        }

        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        setError('An error occurred while fetching orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders found.</div>;

  return (
    <div className="orders-container">
      {/* ✅ Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>Your Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Total Price</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={order.id || idx}>
              <td>{order.id || 'N/A'}</td>
              <td>{order.orderStatus || 'N/A'}</td>
              <td>Rs.{order.totalAmount?.toFixed(2) || '0.00'}</td>
              <td>
                <table className="sub-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, itemIdx) => (
                      <tr key={item.id || itemIdx}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
