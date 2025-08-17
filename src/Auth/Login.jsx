import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/v1/auth/login", { email, password });
      const token = response.data.token;
      sessionStorage.setItem("token", token);

      const userResponse = await axios.get("http://localhost:8080/api/v1/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userResponse.data;
      if (user.roles.includes("ROLE_SHOPKEEPER")) {
        sessionStorage.setItem('shopkeeperId', response.data.shopkeeperId);
        navigate("/shopkeeper-dashboard");
      } else if (user.roles.includes("ROLE_CUSTOMER")) {
        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <div className="signup-link">
        <button onClick={() => navigate("/signup")}>Don't have an account? Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
