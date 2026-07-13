import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🔧</span>
            <h2>School Facility Portal</h2>
          </div>
          <p className="auth-subtitle">Condition Reporting & Repair Tracking</p>
        </div>
        <div className="auth-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
