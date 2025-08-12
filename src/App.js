import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard/ShopkeeperDashboard';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import CartPage from './pages/CartPage'; // your new cart page
import { CartProvider } from './contexts/CartContext';

function App() {
  // hardcoded userId for now — replace with actual logged-in user id
  const userId = 1;

  return (
    <CartProvider userId={userId}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
