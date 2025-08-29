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

// Simple placeOrder (cart items only, no delivery/payment details)
export const placeOrder = async (userId, cart, clearCart, setOrderMessage, setLoading) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    setOrderMessage("Your cart is empty. Add items before placing an order.");
    return;
  }

  setLoading(true);
  setOrderMessage("");

  try {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE}/orders/order?userId=${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart.items.map(item => ({ productId: item.product.id, quantity: item.quantity }))
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setOrderMessage(data.message || "Failed to place order");
      setLoading(false);
      return;
    }

    setOrderMessage("Order placed successfully!");
    if (clearCart) await clearCart();

  } catch (error) {
    console.error("Error placing order:", error);
    setOrderMessage("An error occurred while placing the order.");
  } finally {
    setLoading(false);
  }
};

// Full placeOrderWithDetails (delivery + payment screenshot)
export const placeOrderWithDetails = async (userId, cart, form, setOrderMessage, clearCart, setLoading) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    setOrderMessage("Your cart is empty. Add items before placing an order.");
    return;
  }

  // Mandatory fields validation
  if (!form.dropLocation || !form.landmark || !form.contactNumber || !form.paymentScreenshot) {
    setOrderMessage("All fields including payment screenshot are required.");
    return;
  }

  setLoading(true);
  setOrderMessage("");

  try {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append('dropLocation', form.dropLocation);
    formData.append('landmark', form.landmark);
    formData.append('contactNumber', form.contactNumber);
    formData.append('paymentScreenshot', form.paymentScreenshot);

    cart.items.forEach((item, index) => {
      formData.append(`items[${index}].productId`, item.product.id);
      formData.append(`items[${index}].quantity`, item.quantity);
    });

    const res = await fetch(`${API_BASE}/orders/order-details?userId=${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setOrderMessage(data.message || "Failed to place order");
      return;
    }

    setOrderMessage("Order placed successfully!");
    if (clearCart) await clearCart();

  } catch (err) {
    console.error(err);
    setOrderMessage("Error placing order");
  } finally {
    setLoading(false);
  }
};
