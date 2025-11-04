// src/pages/cart/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const API_PREFIX = '/api/v1/cartItem';

const CartPage = () => {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  const userId = 1; // replace with actual logged-in user id

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

  useEffect(() => {
    fetchCart();
  }, []);

  const updateItem = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(
        `${API_PREFIX}/cart/${cart.id}/item/${itemId}/update?quantity=${newQuantity}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
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

  const removeItem = async itemId => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(
        `${API_PREFIX}/cart/${cart.id}/item/${itemId}/remove`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      <div className="cart-page">
        <h2>My Cart</h2>
        <p>My cart is empty.</p>
        <button className="back-btn" onClick={() => navigate('/customer-dashboard')}>
          Back to Shopping
        </button>
        {/* ✅ New Back button to previous page */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>My Cart</h2>

      {/* ✅ Back button to go to previous page */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        Back
      </button>

      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map(item => (
            <tr key={item.id}>
              <td>{item.product?.name}</td>
              <td>Rs.{(item.product?.price || 0).toFixed(2)}</td>
              <td>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItem(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </td>
              <td>
                Rs.{((item.product?.price || 0) * item.quantity).toFixed(2)}
              </td>
              <td>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <h3>Total: Rs.{totalPrice.toFixed(2)}</h3>
        <div className="actions">
          <button className="clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
          <button
            className="order-btn"
            onClick={() => navigate('/place-order')}
          >
            Place Order
          </button>
          <button className="view-btn" onClick={() => navigate('/orders')}>
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
