import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { registerUser, loading } = useContext(AuthContext);
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

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

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

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { name, email, password, role } = formData;
      await registerUser({ name, email, password, role });
      showToast('Account created successfully! Welcome aboard.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'danger');
    }
  };

  return (
    <form className="auth-form fade-in" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
          placeholder="enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {validationErrors.name && (
          <span className="validation-feedback">{validationErrors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
          placeholder="enter email"
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
          placeholder="create password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {validationErrors.password && (
          <span className="validation-feedback">{validationErrors.password}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
          placeholder="confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {validationErrors.confirmPassword && (
          <span className="validation-feedback">{validationErrors.confirmPassword}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="role">Role</label>
        <select
          id="role"
          className="form-control"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="Maintenance Staff">Maintenance Staff</option>
        </select>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="auth-footer">
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </form>
  );
};

export default Register;
