import React, { useState } from 'react';
import { Rocket, Eye, EyeOff, Facebook, Twitter, Github, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';
import login_background from '../assets/images/login-background.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      // Send login request to your backend API using Axios
      const response = await api.post('users/login', { email, password });

      if (response.status === 200) {
        // Successful login, save token to localStorage
        localStorage.setItem('authToken', response.data.token); // Assuming the token is in response.data.token
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        // Handle error if login fails
        setErrorMessage(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      const validationMessage = error?.response?.data?.errors?.[0]?.msg;
      setErrorMessage(apiMessage || validationMessage || 'An error occurred. Please try again later.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="cm-login-page">
      {/* Left side with illustration */}
      <div className="cm-login-illustration">
        <div className="cm-login-logo">
          <Rocket className="cm-login-logo-icon" />
          <span className="cm-login-logo-text">KONSENTO</span>
        </div>
        
        <div className="cm-login-illustration-container">
          <img 
            src={login_background} 
            alt="Login illustration" 
            className="cm-login-illustration-image"
          />
        </div>
        
        {/* Decorative elements */}
        <div className="cm-login-decorative-shape cm-login-shape-1"></div>
        <div className="cm-login-decorative-shape cm-login-shape-2"></div>
        <div className="cm-login-decorative-shape cm-login-shape-3"></div>
      </div>
      
      {/* Right side with login form */}
      <div className="cm-login-form-container">
        <div className="cm-login-form-wrapper">
          <div className="cm-login-header">
            <h2 className="cm-login-title">Welcome to KONSENTO! 👋</h2>
            <p className="cm-login-subtitle">Please sign-in to your account and start the adventure</p>
          </div>
          
          {errorMessage && (
            <div className="cm-login-error-message">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="cm-login-form">
            <div className="cm-login-form-group">
              <label htmlFor="email" className="cm-login-form-label">Email or Username</label>
              <div className="cm-login-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cm-login-form-input"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>

            <div className="cm-login-form-group">
              <label htmlFor="password" className="cm-login-form-label">Password</label>
              <div className="cm-login-input-wrapper cm-login-password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cm-login-form-input"
                  placeholder="············"
                />
                <button
                  type="button"
                  className="cm-login-password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="cm-login-icon" />
                  ) : (
                    <Eye className="cm-login-icon" />
                  )}
                </button>
              </div>
            </div>

            <div className="cm-login-form-options">
              <div className="cm-login-remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="cm-login-checkbox"
                />
                <label htmlFor="remember-me" className="cm-login-checkbox-label">
                  Remember me
                </label>
              </div>

              <div className="cm-login-forgot-password">
                <a href="#" className="cm-login-forgot-link">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="cm-login-form-submit">
              <button
                type="submit"
                className="cm-login-button"
              >
                Login
              </button>
            </div>
          </form>
          
          <div className="cm-login-footer">
            <div className="cm-login-divider">
              <span className="cm-login-divider-text">or</span>
            </div>

            <div className="cm-login-social-login">
              <a href="#" className="cm-login-social-icon">
                <Facebook />
              </a>
              <a href="#" className="cm-login-social-icon">
                <Twitter />
              </a>
              <a href="#" className="cm-login-social-icon">
                <Mail />
              </a>
              <a href="#" className="cm-login-social-icon">
                <Github />
              </a>
            </div>
            
            <div className="cm-login-signup-prompt">
              <span className="cm-login-signup-text">New on our platform? </span>
              <a href="#" className="cm-login-signup-link">
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;