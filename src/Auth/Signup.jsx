import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [userType, setUserType] = useState('customer');
    const [address, setAddress] = useState('');
    const [shopName, setShopName] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [businessQR, setBusinessQR] = useState(null); // For Shopkeeper
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            let endpoint = '';
            let payload = null;
            let headers = {};

            if (userType === 'shopkeeper') {
                if (!businessQR) {
                    alert('Please upload business QR');
                    return;
                }

                // Use FormData for shopkeeper
                payload = new FormData();
                payload.append('name', name);
                payload.append('email', email);
                payload.append('password', password);
                payload.append('contactNumber', contactNumber);
                payload.append('address', address);
                payload.append('shopName', shopName);
                payload.append('panNumber', panNumber);
                payload.append('businessQR', businessQR);

                endpoint = 'http://localhost:8080/api/v1/auth/signup/shopkeeper';
                headers['Content-Type'] = 'multipart/form-data';
            } else {
                // Use JSON for customer
                payload = { name, email, password, contactNumber, address };
                endpoint = 'http://localhost:8080/api/v1/auth/signup/customer';
                headers['Content-Type'] = 'application/json';
            }

             const response = await axios.post(endpoint, payload, { headers });
             if (userType === 'shopkeeper') {
            sessionStorage.setItem('shopkeeperId', response.data.shopkeeperId);
        }

            alert('Signup successful!');
            navigate('/login');
        } catch (error) {
            console.error('Signup failed', error);
            alert(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                />

                {userType === 'shopkeeper' && (
                    <>
                        <input
                            type="text"
                            placeholder="Shop Name"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                        />
                        
                        <input
                            type="text"
                            placeholder="PAN Number"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value)}
                            required
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBusinessQR(e.target.files[0])}
                            required
                        />
                    </>
                )}

                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />

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
