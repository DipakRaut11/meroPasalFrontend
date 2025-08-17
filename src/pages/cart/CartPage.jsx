// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from "../../api/orderService"; 
import './CartPage.css';

const API_PREFIX = '/api/v1/cartItem';

const CartPage = () => {
  const { cart, setCart } = useCart(); // we need setCart to update state
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const navigate = useNavigate();

  const userId = 1; // replace with actual logged-in user id

  // Helper to fetch cart from backend
  const fetchCart = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/v1/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  const updateItem = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_PREFIX}/cart/${cart.id}/item/${itemId}/update?quantity=${newQuantity}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Update local cart state
        setCart(prev => ({
          ...prev,
          items: prev.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          ),
        }));
      }
    } catch (err) {
      console.error('Error updating item quantity', err);
    }
  };

  const removeItem = async (itemId) => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_PREFIX}/cart/${cart.id}/item/${itemId}/remove`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
        }));
      }
    } catch (err) {
      console.error('Error removing item', err);
    }
  };

  const clearCart = async () => {
    for (const item of cart.items) {
      await removeItem(item.id);
    }
  };

  const totalPrice = cart?.items?.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );


  if (!cart) return <p>Loading cart...</p>;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/customer-dashboard')}>Back to Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <ul>
        {cart.items.map(item => (
          <li key={item.id} className="mb-4 border-b pb-2">
            <strong>{item.product?.name}</strong> — Qty: {item.quantity} — Price: ₹{(item.product?.price || 0).toFixed(2)}
            <div className="mt-2 flex gap-2">
              <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-2 bg-gray-300 rounded">+</button>
              <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 bg-gray-300 rounded">−</button>
              <button onClick={() => removeItem(item.id)} className="px-2 bg-red-400 text-white rounded">Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 font-semibold">Total: ₹{totalPrice.toFixed(2)}</h3>

      <div className="mt-4 flex gap-2">
        <button onClick={clearCart} className="px-4 py-2 bg-gray-400 rounded">Clear Cart</button>
        <button
          onClick={() =>
            placeOrder(userId, cart, clearCart, setOrderMessage, setLoading)
          }
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
        <button onClick={() => navigate('/orders')} className="px-4 py-2 bg-blue-600 text-white rounded">View My Orders</button>
      </div>

      {orderMessage && <p className="mt-2">{orderMessage}</p>}
    </div>
  );
};

export default CartPage;
