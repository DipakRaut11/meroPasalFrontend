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
    <div>
      <h2>Your Orders</h2>
      <ul>
        {orders.map((order, idx) => (
          <li
            key={order.id || idx} // fallback to index if id is missing
            style={{
              border: '1px solid #ccc',
              margin: '10px 0',
              padding: '10px',
            }}
          >
            <p><strong>Order ID:</strong> {order.id || 'N/A'}</p>
            <p><strong>Status:</strong> {order.orderStatus  || 'N/A'}</p>
            <p><strong>Total Price:</strong> ₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {order.items?.map((item, itemIdx) => (
                <li key={item.id || itemIdx}>
                  {item.productName} — Qty: {item.quantity} — Price: ₹{item.price?.toFixed(2)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
