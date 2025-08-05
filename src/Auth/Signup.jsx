import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('customer');
    const [address, setAddress] = useState('');
    const [shopName, setShopName] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userData = userType === 'customer' ? 
                { name, email, password, address } :
                { name, email, password, shopName, address, panNumber };

            let endpoint = userType === 'customer' 
                ? 'http://localhost:8080/api/v1/auth/signup/customer' 
                : 'http://localhost:8080/api/v1/auth/signup/shopkeeper';

            await axios.post(endpoint, userData);
            navigate('/login');
        } catch (error) {
            console.error('Signup failed', error);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Name" value={name} 
                    onChange={(e) => setName(e.target.value)} required />
                
                <input type="email" placeholder="Email" value={email} 
                    onChange={(e) => setEmail(e.target.value)} required />
                
                <input type="password" placeholder="Password" value={password} 
                    onChange={(e) => setPassword(e.target.value)} required />

                {userType === 'shopkeeper' && (
                    <>
                        <input type="text" placeholder="Shop Name" value={shopName} 
                            onChange={(e) => setShopName(e.target.value)} required />
                        
                        <input type="text" placeholder="PAN Number" value={panNumber} 
                            onChange={(e) => setPanNumber(e.target.value)} required />
                    </>
                )}

                <input type="text" placeholder="Address" value={address} 
                    onChange={(e) => setAddress(e.target.value)} required />

                <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="customer">Customer</option>
                    <option value="shopkeeper">Shopkeeper</option>
                </select>

                <button type="submit">Sign Up</button>
            </form>
            <div className="login-link">
                <button onClick={() => navigate('/login')}>Already have an account? Login</button>
            </div>
        </div>
    );
};

export default Signup;