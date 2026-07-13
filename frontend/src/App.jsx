import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import History from './pages/History';

import LandingPage from './pages/LandingPage';

import ComplaintDetails from './pages/ComplaintDetails';

import AdminUsers from './pages/AdminUsers';
import AdminFacilities from './pages/AdminFacilities';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Dashboard/Main Application Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/history" element={<History />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          
          {/* Admin routes */}
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/facilities" element={<AdminFacilities />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}




export default App;
