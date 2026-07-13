import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (user) {
        const res = await notificationService.getMyNotifications();
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Mark all read in state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNavLinks = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/history', label: 'History', icon: '📜' }
    ];

    if (!user) return [];

    if (user.role === 'Student' || user.role === 'Teacher') {
      return [
        ...common,
        { path: '/report', label: 'Report Issue', icon: '🚨' }
      ];
    }

    if (user.role === 'Maintenance Staff') {
      return [
        { path: '/dashboard', label: 'Assigned Tasks', icon: '🔧' },
        { path: '/history', label: 'Job History', icon: '📜' }
      ];
    }

    if (user.role === 'Admin') {
      return [
        ...common,
        { path: '/admin/users', label: 'Users', icon: '👥' },
        { path: '/admin/facilities', label: 'Facilities', icon: '🏫' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' }
      ];
    }

    return common;
  };

  return (
    <div className="dashboard-grid">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="brand">
            <span className="brand-icon">🏫</span>
            <span className="brand-name">Repair Portal</span>
          </div>
        </div>
        <div className="navbar-right">
          {/* Notifications Drawer Anchor */}
          <div className="notifications-container-anchor">
            <div className="notifications-badge" onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <span className="bell-icon">🔔</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-read-all-btn" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No new updates.</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        className={`notification-item-card ${n.isRead ? 'read' : 'unread'}`}
                        onClick={() => handleMarkOneRead(n._id)}
                      >
                        <div className="item-header">
                          <h5>{n.title}</h5>
                          {!n.isRead && <span className="unread-dot"></span>}
                        </div>
                        <p>{n.message}</p>
                        <span className="item-time">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="user-profile">
            <div className="avatar">{user?.name ? user.name.charAt(0) : 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Loading...'}</span>
              <span className="user-role">{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="nav-group">
            {getNavLinks().map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="content-container">
        <Outlet />
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      {/* Click outside to close notifications dropdown */}
      {notificationsOpen && (
        <div className="dropdown-overlay" onClick={() => setNotificationsOpen(false)}></div>
      )}
    </div>
  );
};

export default DashboardLayout;
