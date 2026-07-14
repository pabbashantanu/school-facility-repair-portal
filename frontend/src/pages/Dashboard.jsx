import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import complaintService from '../services/complaintService';
import adminService from '../services/adminService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  
  // Repair resolution details
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionFiles, setCompletionFiles] = useState([]);
  const [submittingRepair, setSubmittingRepair] = useState(false);
  
  // Assign details
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let res;
      if (user?.role === 'Admin') {
        res = await adminService.getAllComplaints();
        // Fetch staff list for assignment dropdown
        const usersRes = await adminService.getUsers();
        const staff = usersRes.data.filter(u => u.role === 'Maintenance Staff');
        setStaffList(staff);
      } else if (user?.role === 'Maintenance Staff') {
        res = await complaintService.getAssignedComplaints();
      } else {
        res = await complaintService.getMyComplaints();
      }
      
      const data = res.data;
      setComplaints(data);

      const computedStats = data.reduce(
        (acc, item) => {
          acc.total += 1;
          if (item.status === 'Pending Approval' || item.status === 'Assigned') acc.pending += 1;
          else if (item.status === 'In Progress') acc.progress += 1;
          else if (item.status === 'Resolved') acc.resolved += 1;
          return acc;
        },
        { total: 0, pending: 0, progress: 0, resolved: 0 }
      );

      setStats(computedStats);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not load dashboard information.';
      setError(msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStartWork = async (id) => {
    try {
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('notes', 'Started repair job');
      await complaintService.updateComplaintStatus(id, formData);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update job status.';
      setError(msg);
    }
  };

  const openResolveModal = (id) => {
    setSelectedComplaintId(id);
    setCompletionNotes('');
    setCompletionFiles([]);
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRepair(true);

    const formData = new FormData();
    formData.append('status', 'Resolved');
    formData.append('notes', completionNotes);
    completionFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await complaintService.updateComplaintStatus(selectedComplaintId, formData);
      setResolveModalOpen(false);
      setSubmittingRepair(false);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit completion report.';
      setError(msg);
      setSubmittingRepair(false);
    }
  };

  const openAssignModal = (id) => {
    setSelectedComplaintId(id);
    setSelectedStaffId('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setSubmittingAssign(true);

    try {
      await adminService.assignComplaint(selectedComplaintId, selectedStaffId);
      setAssignModalOpen(false);
      setSubmittingAssign(false);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to assign complaint.';
      setError(msg);
      setSubmittingAssign(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending Approval': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Low': return 'sev-low';
      case 'Medium': return 'sev-medium';
      case 'High': return 'sev-high';
      case 'Critical': return 'sev-critical';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard summaries...</div>;
  }

  // --- RENDERING ADMIN VIEW ---
  if (user?.role === 'Admin') {
    return (
      <div className="dashboard-container">
        <div className="welcome-banner">
          <h2>Admin Dashboard</h2>
          <p>Global oversight of complaints, assignment tasks, user profiles and school facility registers.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* Metrics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-title">Total Registered Reports</span>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-title">Pending Assignment</span>
            </div>
          </div>
          <div className="stat-card progress">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <span className="stat-num">{stats.progress}</span>
              <span className="stat-title">Under Active Repair</span>
            </div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-num">{stats.resolved}</span>
              <span className="stat-title">Resolved Repairs</span>
            </div>
          </div>
        </div>

        {/* Admin Complaints Queue Table */}
        <div className="staff-panel">
          <h3>Active Complaint Backlog</h3>
          <div style={{ marginTop: '20px', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table className="complaint-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Reporter</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Issue Title</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Severity</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Assignee</th>
                  <th style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints logged in system.</td>
                  </tr>
                ) : (
                  complaints.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>{c.reporter?.name} ({c.reporter?.role})</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{c.title}</td>
                      <td style={{ padding: '12px 16px' }}>{c.facility?.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge-sev ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge-status ${getStatusClass(c.status)}`}>{c.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{c.assignedTo?.name || 'Unassigned'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.status === 'Pending Approval' ? (
                          <button className="start-job-btn" onClick={() => openAssignModal(c._id)}>
                            Assign Staff
                          </button>
                        ) : (
                          <Link to={`/complaints/${c._id}`} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                            Details &rarr;
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assignment Modal */}
        {assignModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Assign Complaint Task</h3>
              <form onSubmit={handleAssignSubmit}>
                <div className="form-group">
                  <label htmlFor="staff">Select Maintenance Staff Member</label>
                  <select
                    id="staff"
                    className="form-control"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Assignee --</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setAssignModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm" disabled={submittingAssign || !selectedStaffId}>
                    {submittingAssign ? 'Assigning...' : 'Assign Repair'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERING MAINTENANCE STAFF VIEW ---
  if (user?.role === 'Maintenance Staff') {
    return (
      <div className="dashboard-container">
        <div className="welcome-banner">
          <h2>Welcome Back, {user.name}!</h2>
          <p>Here are your assigned repair tasks. Keep the campus functional by resolving issues promptly.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-content">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-title">Total Assigned Jobs</span>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">📥</div>
            <div className="stat-content">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-title">Assigned / Needs Review</span>
            </div>
          </div>
          <div className="stat-card progress">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <span className="stat-num">{stats.progress}</span>
              <span className="stat-title">In Progress Tasks</span>
            </div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-num">{stats.resolved}</span>
              <span className="stat-title">Resolved Repairs</span>
            </div>
          </div>
        </div>

        <div className="staff-panel">
          <h3>Your Repair Queue</h3>
          <div className="staff-queue-grid">
            {complaints.length === 0 ? (
              <div className="empty-panel-state">No jobs currently assigned to you.</div>
            ) : (
              complaints.map(c => (
                <div key={c._id} className="staff-job-card">
                  <div className="job-card-header">
                    <span className={`badge-sev ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                    <span className={`badge-status ${getStatusClass(c.status)}`}>{c.status}</span>
                  </div>
                  
                  <h4>{c.title}</h4>
                  <p className="job-facility">📍 {c.facility?.name} ({c.facility?.building})</p>
                  <p className="job-desc">{c.description}</p>
                  
                  <div className="job-actions-row">
                    <Link to={`/complaints/${c._id}`} className="view-job-link">View Details</Link>
                    
                    {c.status === 'Assigned' && (
                      <button className="start-job-btn" onClick={() => handleStartWork(c._id)}>
                        Start Work
                      </button>
                    )}

                    {c.status === 'In Progress' && (
                      <button className="resolve-job-btn" onClick={() => openResolveModal(c._id)}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {resolveModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Complete Repair Report</h3>
              <form onSubmit={handleResolveSubmit}>
                <div className="form-group">
                  <label htmlFor="notes">Resolution Notes</label>
                  <textarea
                    id="notes"
                    rows="4"
                    className="form-control"
                    placeholder="Describe what was repaired/fixed..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="comp-images">Upload Completion Proof Images</label>
                  <input
                    type="file"
                    id="comp-images"
                    multiple
                    accept="image/*"
                    onChange={(e) => setCompletionFiles(Array.from(e.target.files))}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setResolveModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm" disabled={submittingRepair}>
                    {submittingRepair ? 'Submitting...' : 'Complete Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERING STUDENT/TEACHER VIEW ---
  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <h2>Welcome Back, {user?.name || 'User'}!</h2>
        <p>Monitor reports, file complaints, and view live resolution updates for facility damages.</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-title">Total Filed Reports</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-num">{stats.pending}</span>
            <span className="stat-title">Pending Action</span>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <span className="stat-num">{stats.progress}</span>
            <span className="stat-title">In Progress</span>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-num">{stats.resolved}</span>
            <span className="stat-title">Resolved</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="activity-panel">
          <div className="panel-header">
            <h3>Recent Damage Reports</h3>
            <Link to="/history" className="panel-link">View All History &rarr;</Link>
          </div>

          <div className="complaint-list">
            {complaints.length === 0 ? (
              <div className="empty-panel-state">
                <p>You haven't reported any facility issues yet.</p>
                <Link to="/report" className="cta-report-btn">File First Complaint</Link>
              </div>
            ) : (
              complaints.slice(0, 4).map(c => (
                <div key={c._id} className="complaint-item-card">
                  <div className="item-details">
                    <h4>{c.title}</h4>
                    <p>{c.facility?.name} • Room: {c.facility?.building}</p>
                    <span className="report-date">Filed on {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="item-action">
                    <span className={`badge-status ${getStatusClass(c.status)}`}>{c.status}</span>
                    <Link to={`/complaints/${c._id}`} className="view-details-btn">Track &rarr;</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions-panel">
          <h3>Quick Links</h3>
          <div className="action-links-grid">
            <Link to="/report" className="action-link-card">
              <span className="action-card-icon">🚨</span>
              <span>Report New Issue</span>
            </Link>
            <Link to="/history" className="action-link-card">
              <span className="action-card-icon">📜</span>
              <span>Complaint Logs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
