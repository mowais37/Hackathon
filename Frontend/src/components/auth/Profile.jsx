// src/components/auth/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/auth/authContext';
import { validateEmail } from '../../utils/validateForm';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const { user, loading, updateUser } = authContext;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const { name, email, currentPassword, newPassword, confirmPassword } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null
      });
    }
    // Clear success message when form changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!name) {
      errors.name = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Only validate password fields if user is trying to change password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        errors.currentPassword = 'Current password is required to change password';
      }
      
      if (newPassword && newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = e => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      // Call API to update profile
      // This is a placeholder - in a real app you would have this function in your context
      updateUser(formData);
      setSuccessMessage('Profile updated successfully');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-section">
          <h2>Account Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={onChange}
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <p className="error-text">{formErrors.name}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={onChange}
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && <p className="error-text">{formErrors.email}</p>}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Change Password</h2>
          
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={currentPassword}
              onChange={onChange}
              className={formErrors.currentPassword ? 'error' : ''}
            />
            {formErrors.currentPassword && (
              <p className="error-text">{formErrors.currentPassword}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={newPassword}
              onChange={onChange}
              className={formErrors.newPassword ? 'error' : ''}
            />
            {formErrors.newPassword && (
              <p className="error-text">{formErrors.newPassword}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className={formErrors.confirmPassword ? 'error' : ''}
            />
            {formErrors.confirmPassword && (
              <p className="error-text">{formErrors.confirmPassword}</p>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;