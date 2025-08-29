import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/v1/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      sessionStorage.setItem("token", token);

      const user = response.data;

      // Check for redirect path stored in localStorage
      const redirectPath = localStorage.getItem("redirectAfterLogin");

      if (user.roles.includes("ROLE_SHOPKEEPER")) {
        if (response.data.shopkeeperId) {
          sessionStorage.setItem("shopkeeperId", response.data.shopkeeperId);
        }
        navigate("/shopkeeper-dashboard");
      } else if (user.roles.includes("ROLE_CUSTOMER")) {
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin"); // clear after use
          navigate(redirectPath);
        } else {
          navigate("/customer-dashboard");
        }
      } else if (user.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please check your email and password.");
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
        <button onClick={() => navigate("/signup")}>
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
