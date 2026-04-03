import React, { useState, useEffect } from "react";
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

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
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
    <div className="add-user-form-overlay">
      <div className="add-user-form-container">
        <h2>Add New User</h2>

        {successMessage && <div className="add-user-form-success">{successMessage}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(userData);
          }}
        >
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />

          <label>Role:</label>
          <select name="role_id" value={userData.role_id} onChange={handleChange} required>
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <div className="add-user-form-buttons">
            <button type="submit" className="add-user-form-btn">Add User</button>
            <button
              type="button"
              className="add-user-form-btn add-user-form-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
