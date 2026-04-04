import React, { useState, useEffect } from "react";
import { X, Mail, User, ShieldCheck, Lock } from "lucide-react";
import "../styles/AddUserForm.css";

// List of roles
const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Executive" },
  { id: 3, name: "Operator" },
  { id: 4, name: "IT Manager" },
  { id: 5, name: "Customer Support" },
];

const AddUserForm = ({ onClose, onSubmit, successMessage }) => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      setUserData({ username: "", email: "", password: "", role_id: "" });

      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [successMessage, onClose]);

  return (
    <div className="add-user-form-overlay" onClick={onClose}>
      <div className="add-user-form-container">
        <div className="add-user-form-header">
          <div>
            <h2>Add New User</h2>
            <p>Create an account and assign the appropriate role access.</p>
          </div>
          <button className="add-user-form-close-btn" onClick={onClose} aria-label="Close add user dialog">
            <X size={16} />
          </button>
        </div>

        {successMessage && <div className="add-user-form-success">{successMessage}</div>}

        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <label>
            <User size={14} /> Username
          </label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            placeholder="e.g. jane.doe"
          />

          <label>
            <Mail size={14} /> Email
          </label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            placeholder="user@company.com"
          />

          <label>
            <Lock size={14} /> Password
          </label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Minimum 8 characters"
          />
          <small className="add-user-form-helper">Use at least 8 characters for stronger account security.</small>

          <label>
            <ShieldCheck size={14} /> Role
          </label>
          <select name="role_id" value={userData.role_id} onChange={handleChange} required>
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <div className="add-user-form-buttons">
            <button
              type="button"
              className="add-user-form-btn add-user-form-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="add-user-form-btn add-user-form-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
