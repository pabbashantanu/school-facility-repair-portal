import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const { loginUser, loading } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await loginUser(formData);
      showToast('Welcome to FixEdu repair tracking portal!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid login credentials', 'danger');
    }
  };

  return (
    <form className="auth-form fade-in" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
          placeholder="enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationErrors.email && (
          <span className="validation-feedback">{validationErrors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
          placeholder="enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {validationErrors.password && (
          <span className="validation-feedback">{validationErrors.password}</span>
        )}
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="auth-footer">
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p style={{ marginTop: '8px' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
