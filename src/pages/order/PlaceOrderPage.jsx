// src/pages/PlaceOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './PlaceOrderPage.css';

const PlaceOrderPage = () => {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [adminQr, setAdminQr] = useState(null); // Admin QR URL
  const [form, setForm] = useState({
    dropLocation: '',
    contactNumber: '',
    landmark: '',
    paymentScreenshot: null,
  });

  useEffect(() => {
    fetchAdminQr();
  }, []);

  const fetchAdminQr = async () => {
    // Directly set the URL since the backend serves the QR image
    setAdminQr('http://localhost:8080/api/v1/admin/qr');
  };

  const handleChange = (e) => {
    if (e.target.name === 'paymentScreenshot') {
      setForm({ ...form, paymentScreenshot: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleConfirmOrder = async () => {
    if (!form.dropLocation || !form.contactNumber || !form.landmark || !form.paymentScreenshot) {
      alert('All fields including payment screenshot are required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('dropLocation', form.dropLocation);
      formData.append('contactNumber', form.contactNumber);
      formData.append('landmark', form.landmark);
      formData.append('paymentScreenshot', form.paymentScreenshot);

      // Append cart items
      formData.append('items', JSON.stringify(cart.items));

      const res = await fetch(`http://localhost:8080/api/v1/orders/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Order placed successfully!');
        setCart({ ...cart, items: [] }); // Clear local cart
        navigate('/orders');
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order', err);
      alert('Error placing order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="place-order-container">
      <h3>Delivery & Payment Details</h3>

      {/* Admin QR for Payment */}
      {adminQr && (
        <div className="admin-qr-section">
          <h4>Scan Admin QR to Pay</h4>
          <img
            src={adminQr}
            alt="Admin QR"
            className="qr-image"
          />
        </div>
      )}

      {/* Order Form */}
      <input
        type="text"
        name="dropLocation"
        placeholder="Drop Location"
        value={form.dropLocation}
        onChange={handleChange}
      />
      <input
        type="text"
        name="contactNumber"
        placeholder="Receiver Contact Number"
        value={form.contactNumber}
        onChange={handleChange}
      />
      <input
        type="text"
        name="landmark"
        placeholder="Famous Landmark"
        value={form.landmark}
        onChange={handleChange}
      />
      <label className="file-label">
        Upload Payment Screenshot <span style={{ color: 'red' }}>*</span>
        <input type="file" name="paymentScreenshot" accept="image/*" onChange={handleChange} />
      </label>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleConfirmOrder}
          disabled={submitting}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {submitting ? 'Placing Order...' : 'Confirm Order'}
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="px-4 py-2 bg-gray-400 rounded"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
