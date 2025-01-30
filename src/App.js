import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ShopkeeperDashboard from './components/ShopkeeperDashboard';
import CustomerDashboard from './components/CustomerDashboard';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/shopkeeper-dashboard"
                    element={
                       
                            <ShopkeeperDashboard />
                        
                    }
                />
                <Route
                    path="/customer-dashboard"
                    element={
                        
                            <CustomerDashboard />
                       
                    }
                />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;