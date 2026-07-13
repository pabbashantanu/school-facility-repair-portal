import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-logo">🏫</span>
          <h1>FixEdu</h1>
        </div>
        <nav className="landing-nav">
          <Link to="/login" className="nav-link-btn login-btn">Sign In</Link>
          <Link to="/register" className="nav-link-btn register-btn">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="badge-tag">⚡ Smart Infrastructure Management</span>
          <h2 className="hero-title">
            Keep Your School Safe, Clean & <span className="highlight">Fully Functional</span>
          </h2>
          <p className="hero-subtitle">
            The unified system for students, teachers, and maintenance teams to report facility damages and track repairs in real-time.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="cta-primary">Report an Issue Now</Link>
            <a href="#features" className="cta-secondary">See How It Works</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mockup-frame">
            <div className="mockup-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="mockup-title">Repair Tracking Dashboard</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-stat-grid">
                <div className="mockup-stat-card">
                  <span className="stat-label">Active Reports</span>
                  <span className="stat-value">12</span>
                </div>
                <div className="mockup-stat-card">
                  <span className="stat-label">Resolved Today</span>
                  <span className="stat-value text-success">8</span>
                </div>
                <div className="mockup-stat-card">
                  <span className="stat-label">Avg. Fix Time</span>
                  <span className="stat-value text-primary">2.4 hrs</span>
                </div>
              </div>
              <div className="mockup-list">
                <div className="mockup-item">
                  <span className="status-indicator yellow"></span>
                  <div className="mockup-item-text">
                    <p className="item-title">HVAC Unit Failure</p>
                    <p className="item-sub">Science Lab • Reported by Prof. Davis</p>
                  </div>
                  <span className="severity-badge critical">Critical</span>
                </div>
                <div className="mockup-item">
                  <span className="status-indicator green"></span>
                  <div className="mockup-item-text">
                    <p className="item-title">Leaky Faucet</p>
                    <p className="item-sub">Gym Locker Room • Assigned to Dave M.</p>
                  </div>
                  <span className="severity-badge low">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h3>Built For The Entire School Community</h3>
          <p>Specially customized dashboards tailored to each user role</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧑‍🎓</div>
            <h4>Students & Teachers</h4>
            <p>Report issues in seconds by taking pictures of the damage. Stay updated with push alerts and email notifications.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h4>Maintenance Staff</h4>
            <p>View assigned tickets, update completion progress, and upload after-repair photos directly from mobile devices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h4>Administration</h4>
            <p>Manage facilities, assign tasks based on severity, view historical analytics, and export repair history reports.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} FixEdu Portal. Developed for Academic Facilities Maintenance.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
