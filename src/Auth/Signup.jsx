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
    const [businessQR, setBusinessQR] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('error'); // 'error' or 'success'
    const navigate = useNavigate();

    const showPopup = (message, type = 'error') => {
        setPopupMessage(message);
        setPopupType(type);
        setTimeout(() => setPopupMessage(''), 3000); // hide after 3s
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            let endpoint = '';
            let payload = null;
            let headers = {};

            if (userType === 'shopkeeper') {
                if (!businessQR) {
                    showPopup('Please upload business QR', 'error');
                    return;
                }

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
                payload = { name, email, password, contactNumber, address };
                endpoint = 'http://localhost:8080/api/v1/auth/signup/customer';
                headers['Content-Type'] = 'application/json';
            }

            const response = await axios.post(endpoint, payload, { headers });

            if (userType === 'shopkeeper' && response.data.shopkeeperId) {
                sessionStorage.setItem('shopkeeperId', response.data.shopkeeperId);
            }

             // Show different message based on user type
        if (userType === 'shopkeeper') {
            showPopup('Signup successful! Your account will be approved by admin within 24 hours.', 'success');
        } else {
            showPopup('Signup successful!', 'success');
        }

        setTimeout(() => navigate('/login'), 3000); // navigate after showing success

        } catch (error) {
            console.error('Signup failed', error);
            const message = error.response?.data?.message || 
                'Information do not meet requirements or Email already in use!';
            showPopup(message, 'error');
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>

            {/* Popup message */}
            {popupMessage && (
                <div className={`popup-message ${popupType}`}>
                    {popupMessage}
                </div>
            )}

            <form onSubmit={handleSignup}>
                   <label>Name</label>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                   <label>Email</label>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                   <label>Password</label>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                   <label>Contact Number</label>
                <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />

                {userType === 'shopkeeper' && (
                    <>
                       <label>Shop Name</label>
                        <input type="text" placeholder="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
                           <label>PAN number</label>
                        <input type="text" placeholder="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} required />
                           <label>Business QR</label>
                        <input type="file" accept="image/*" onChange={(e) => setBusinessQR(e.target.files[0])} required />
                    </>
                )}
                <label>Address</label>
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
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
