import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const API_BASE = "http://localhost:8080/api/v1/profile";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser)
      .catch(() => setError("Failed to fetch profile"));
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (formData.newPassword && !formData.currentPassword) {
      setError("Current password is required to change password");
      setSuccess("");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Update failed");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setSuccess("Profile updated successfully");
      setError("");
      setEditing(false);
      setFormData({});
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleLogout = (permanent = false) => {
    if (permanent) {
      const currentPassword = prompt(
        "Enter your current password to permanently delete your account:"
      );
      if (!currentPassword) return;

      fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.message || "Account deletion failed");
          }
          sessionStorage.clear();
          navigate("/login");
        })
        .catch((err) => setError(err.message));
    } else {
      sessionStorage.clear();
      navigate("/login");
    }
  };

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* ✅ Back/Cancel button to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary back-button"
        >
          ⬅ Cancel / Back
        </button>

        <h2 className="profile-header">My Profile</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {!editing ? (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact Number:</span>
              <span className="info-value">{user.contactNumber || "-"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address:</span>
              <span className="info-value">{user.address || "-"}</span>
            </div>

            <button
              onClick={() => {
                setEditing(true);
                setFormData({
                  name: user.name,
                  email: user.email,
                  contactNumber: user.contactNumber || "",
                  address: user.address || "",
                });
              }}
              className="btn btn-primary"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">Name:</label>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number:</label>
              <input
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address:</label>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="password-section">
              <h3 className="password-header">Password Change (optional)</h3>

              <div className="form-group">
                <label className="form-label">Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword || ""}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword || ""}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleUpdate} className="btn btn-success">
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button onClick={() => handleLogout(false)} className="btn btn-warning">
            Logout
          </button>
          <button onClick={() => handleLogout(true)} className="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
