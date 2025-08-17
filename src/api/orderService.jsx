// src/api/orderService.js
import { API_BASE } from '../utils/constants';

// Fetch all orders for the shopkeeper
export const getShopOrders = async (token) => {
  const response = await fetch(`${API_BASE}/orders/shop-orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error('Failed to fetch shop orders:', errText);
    throw new Error('Failed to fetch shop orders');
  }
  return response.json();
};


// Update order status by shopkeeper
export const updateOrderStatus = async (orderId, status, token) => {
  const url = `${API_BASE}/orders/${orderId}/status?status=${encodeURIComponent(status)}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Failed to update order status:', errText);
    throw new Error('Failed to update order status');
  }
  return response.json();
};


// src/services/orderService.js
export const placeOrder = async (userId, cart, clearCart, setOrderMessage, setLoading) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    setOrderMessage("Your cart is empty. Add items before placing an order.");
    return;
  }

  setLoading(true);
  setOrderMessage("");

  try {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`/api/v1/orders/order?userId=${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setOrderMessage(data.message || "Failed to place order");
      setLoading(false);
      return;
    }

    setOrderMessage("Order placed successfully!");
    if (clearCart) {
      await clearCart();
    }
  } catch (error) {
    console.error("Error placing order:", error);
    setOrderMessage("An error occurred while placing the order.");
  } finally {
    setLoading(false);
  }
};


