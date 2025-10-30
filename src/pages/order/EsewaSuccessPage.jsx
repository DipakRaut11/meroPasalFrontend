import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from '../../contexts/CartContext';

const EsewaSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  // 1️⃣ Decode eSewa payment info
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get("data"); // base64 encoded JSON

  let paymentInfo = null;
  if (data) {
    try {
      const decoded = atob(data); // decode base64
      paymentInfo = JSON.parse(decoded); // parse JSON
    } catch (err) {
      console.error("Failed to parse eSewa data", err);
    }
  }

  // 2️⃣ Callback to handle backend order creation
  const handleEsewaSuccessCallback = async (paymentInfo) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8080/api/v1/orders/esewa-success',
        {
          transactionUuid: paymentInfo.transaction_uuid,
          totalAmount: paymentInfo.total_amount,
          productCode: paymentInfo.product_code,
          signature: paymentInfo.signature,
          dropLocation: paymentInfo.dropLocation || "", // optional fallback
          landmark: paymentInfo.landmark || "",
          receiverContact: paymentInfo.receiverContact || ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Clear frontend cart
      setCart({ ...cart, items: [] });

      // ✅ Redirect to orders page
      navigate('/orders');
    } catch (err) {
      console.error('Failed to create order after eSewa payment', err);
      alert('Payment succeeded but order creation failed. Please contact support.');
    }
  };

  // 3️⃣ Run callback after page loads
  useEffect(() => {
    if (paymentInfo) {
      handleEsewaSuccessCallback(paymentInfo);
    }
  }, [paymentInfo]);

  return (
    <div>
      <h2>eSewa Payment Successful!</h2>
      {paymentInfo ? (
        <div>
          <p>Status: {paymentInfo.status}</p>
          <p>Total Amount: {paymentInfo.total_amount}</p>
          <p>Transaction ID: {paymentInfo.transaction_uuid}</p>
        </div>
      ) : (
        <p>Invalid payment data received.</p>
      )}
    </div>
  );
};

export default EsewaSuccessPage;
