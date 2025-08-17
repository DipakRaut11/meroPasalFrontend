// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard/ShopkeeperDashboard';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import CartPage from './pages/cart/CartPage';
import OrdersPage from './pages/order/OrdersPage';  // <-- import OrdersPage here
import { CartProvider } from './contexts/CartContext';
import AdminPage from './pages/admin/AdminPage';


function App() {
  const userId = 1; // TODO: Replace with real logged-in user id

  return (
    <CartProvider userId={userId}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} /> {/* Added orders route */}
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
