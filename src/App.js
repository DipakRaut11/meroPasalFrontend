// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home/Home";
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard/ShopkeeperDashboard';
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard';
import CartPage from './pages/cart/CartPage';
import OrdersPage from './pages/order/OrdersPage';  // <-- import OrdersPage here
import { CartProvider } from './contexts/CartContext';
import AdminPage from './pages/admin/AdminPage';
import PlaceOrderPage from './pages/order/PlaceOrderPage';
import ProductDetail from './pages/ProductDetail/ProductDetail';



function App() {
  const userId = 1; // TODO: Replace with real logged-in user id

  return (
    <CartProvider userId={userId}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} /> {/* public product list */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/place-order" element={<PlaceOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} /> {/* orders route */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/product/:id" element={<ProductDetail />} /> {/* product detail route */}
        </Routes>
      </Router>
    </CartProvider>
  );
}


export default App;
