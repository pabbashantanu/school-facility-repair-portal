import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import './ComplaintDetails.css';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await complaintService.getComplaintById(id);
        setComplaint(res.data);
        setHistory(res.history || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load details');
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

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
    return <div className="loading-state">Loading repair tracker...</div>;
  }

  if (error) {
    return (
      <div className="details-error-container">
        <div className="error-alert">⚠️ {error}</div>
        <Link to="/history" className="back-link">&larr; Back to History</Link>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-header-row">
        <Link to="/history" className="back-link">&larr; Back to History</Link>
        <span className={`badge-status ${getStatusClass(complaint.status)}`}>{complaint.status}</span>
      </div>

      <div className="details-grid">
        {/* Left Side: General Info & Images */}
        <div className="details-left">
          <div className="details-card">
            <span className={`badge-sev ${getSeverityClass(complaint.severity)}`}>{complaint.severity} Severity</span>
            <h2>{complaint.title}</h2>
            <p className="reporter-info">
              Reported by {complaint.reporter?.name} on {new Date(complaint.createdAt).toLocaleDateString()}
            </p>

            <div className="info-section">
              <h4>Facility & Location</h4>
              <p>📍 {complaint.facility?.name} — {complaint.facility?.building}</p>
              {complaint.facility?.locationDetails && (
                <p className="loc-sub">Details: {complaint.facility.locationDetails}</p>
              )}
            </div>

            <div className="info-section">
              <h4>Damage Description</h4>
              <p className="description-text">{complaint.description}</p>
            </div>

            {complaint.images && complaint.images.length > 0 && (
              <div className="info-section">
                <h4>Uploaded Proof Images</h4>
                <div className="images-gallery">
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={`http://localhost:5000${img}`} target="_blank" rel="noreferrer" className="gallery-item">
                      <img src={`http://localhost:5000${img}`} alt={`proof-${idx}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Completion Details if Resolved */}
          {complaint.status === 'Resolved' && complaint.completionDetails && (
            <div className="details-card completion-card">
              <h3>🎉 Repair Completed</h3>
              <p className="completed-date">
                Marked complete on {new Date(complaint.completionDetails.completedAt || complaint.updatedAt).toLocaleDateString()}
              </p>
              {complaint.completionDetails.notes && (
                <div className="info-section">
                  <h4>Completion Remarks</h4>
                  <p className="completion-notes">{complaint.completionDetails.notes}</p>
                </div>
              )}
              {complaint.completionDetails.images && complaint.completionDetails.images.length > 0 && (
                <div className="info-section">
                  <h4>Completion Proof Images</h4>
                  <div className="images-gallery">
                    {complaint.completionDetails.images.map((img, idx) => (
                      <a key={idx} href={`http://localhost:5000${img}`} target="_blank" rel="noreferrer" className="gallery-item">
                        <img src={`http://localhost:5000${img}`} alt={`resolved-${idx}`} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Timeline & Assignment */}
        <div className="details-right">
          {/* Assignment Info */}
          <div className="details-card">
            <h3>Assignee Details</h3>
            {complaint.assignedTo ? (
              <div className="assignee-profile">
                <span className="profile-icon">👷</span>
                <div>
                  <p className="assignee-name">{complaint.assignedTo.name}</p>
                  <p className="assignee-email">{complaint.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="no-assignee">Waiting for administrator assignment.</p>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="details-card">
            <h3>Activity History</h3>
            <div className="timeline">
              {history.map((h, index) => (
                <div key={h._id || index} className="timeline-item">
                  <div className="timeline-icon">🔹</div>
                  <div className="timeline-content">
                    <p className="timeline-action">{h.action}</p>
                    {h.notes && <p className="timeline-notes">"{h.notes}"</p>}
                    <span className="timeline-meta">
                      by {h.performedBy?.name} ({h.performedBy?.role}) • {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
