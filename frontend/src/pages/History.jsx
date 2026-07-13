import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import Skeleton from '../components/Skeleton';
import './History.css';

const History = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints({
        page,
        limit: 10,
        status,
        severity,
        search
      });
      setComplaints(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalResults(res.pagination?.totalResults || 0);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch your complaint logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, severity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setPage(1);
    if (id === 'status') setStatus(value);
    if (id === 'severity') setSeverity(value);
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

  return (
    <div className="history-container">
      <div className="page-header-row">
        <div>
          <h2>Complaint History</h2>
          <p>Track all your submitted facility damage reports and resolution statuses.</p>
        </div>
        <Link to="/report" className="report-btn">+ Report New Issue</Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Filter and Search Panel */}
      <div className="filter-panel-row">
        <form onSubmit={handleSearchSubmit} className="search-form-group">
          <input
            type="text"
            className="form-control-sm search-input"
            placeholder="Search issue title or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        <div className="filters-group-row">
          <div className="filter-group">
            <label htmlFor="status">Filter by Status</label>
            <select id="status" className="form-control-sm" value={status} onChange={handleFilterChange}>
              <option value="All">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="severity">Filter by Severity</label>
            <select id="severity" className="form-control-sm" value={severity} onChange={handleFilterChange}>
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton type="title" />
            <Skeleton type="text" count={6} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints match your selection.</div>
        ) : (
          <>
            <table className="complaint-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Facility</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="complaint-title">{c.title}</span>
                    </td>
                    <td>
                      {c.facility?.name} <span className="building-sub">({c.facility?.building})</span>
                    </td>
                    <td>
                      <span className={`badge-sev ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${getStatusClass(c.status)}`}>{c.status}</span>
                    </td>
                    <td>
                      <Link to={`/complaints/${c._id}`} className="details-link">Details &rarr;</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  &larr; Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages} (Total results: {totalResults})
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
