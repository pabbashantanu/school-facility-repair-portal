import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user directory');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      setError('');
      setSuccess('');
      await adminService.updateUser(id, { role: newRole });
      setSuccess('User role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleVerificationChange = async (id, status) => {
    try {
      setError('');
      setSuccess('');
      await adminService.updateUser(id, { isVerified: status });
      setSuccess('User status updated');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  if (loading) return <div className="loading-state">Loading user directories...</div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h2>User Management</h2>
        <p>Update system permissions, promote users, or toggle verified account status.</p>
      </div>

      {error && <div className="error-alert">⚠️ {error}</div>}
      {success && <div className="success-alert" style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>✓ {success}</div>}

      <div className="table-wrapper">
        <table className="complaint-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined Date</th>
              <th>Verification</th>
              <th>System Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleVerificationChange(u._id, !u.isVerified)}
                    style={{
                      background: u.isVerified ? 'var(--success-glow)' : 'var(--danger-glow)',
                      color: u.isVerified ? 'var(--success)' : 'var(--danger)',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {u.isVerified ? 'Verified' : 'Unverified'}
                  </button>
                </td>
                <td>
                  <select
                    className="form-control-sm"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Maintenance Staff">Maintenance Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
