import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import complaintService from '../services/complaintService';

const AdminFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    locationDetails: '',
    description: ''
  });

  const fetchFacilities = async () => {
    try {
      const res = await complaintService.getFacilities();
      setFacilities(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch facility records');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleReset = () => {
    setFormData({ name: '', building: '', locationDetails: '', description: '' });
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await adminService.updateFacility(selectedId, formData);
        setSuccess('Facility records updated successfully');
      } else {
        await adminService.createFacility(formData);
        setSuccess('Facility created successfully');
      }
      handleReset();
      fetchFacilities();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditClick = (fac) => {
    setIsEditing(true);
    setSelectedId(fac._id);
    setFormData({
      name: fac.name,
      building: fac.building,
      locationDetails: fac.locationDetails || '',
      description: fac.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this facility? All linked complaints could be affected.')) return;
    setError('');
    setSuccess('');

    try {
      await adminService.deleteFacility(id);
      setSuccess('Facility removed successfully');
      fetchFacilities();
    } catch (err) {
      setError('Failed to delete facility');
    }
  };

  if (loading) return <div className="loading-state">Loading facility logs...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
      
      {/* Left side: Facilities Table */}
      <div>
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <h2>Facilities Registry</h2>
          <p>Add, edit, or remove classrooms, blocks, or labs in the system.</p>
        </div>

        {success && <div className="success-alert" style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>✓ {success}</div>}

        <div className="table-wrapper">
          <table className="complaint-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Building/Block</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map(fac => (
                <tr key={fac._id}>
                  <td><strong>{fac.name}</strong></td>
                  <td>{fac.building}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(fac)}
                      style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px', fontSize: '12px', fontWeight: '600' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(fac._id)}
                      style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right side: CRUD Form Card */}
      <div style={{ alignSelf: 'start', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px', marginTop: '70px' }}>
        <h3>{isEditing ? 'Edit Facility Record' : 'Register New Facility'}</h3>
        
        {error && <div className="error-alert" style={{ marginTop: '16px' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="name">Facility Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="e.g. Physics Lab, Gym B"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="building">Building / Wing</label>
            <input
              type="text"
              id="building"
              className="form-control"
              placeholder="e.g. Science Block, West Wing"
              value={formData.building}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationDetails">Specific Directions</label>
            <input
              type="text"
              id="locationDetails"
              className="form-control"
              placeholder="e.g. Second Floor, beside elevators"
              value={formData.locationDetails}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Facility Description</label>
            <textarea
              id="description"
              rows="3"
              className="form-control"
              placeholder="Equipment, general uses..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="btn">
              {isEditing ? 'Update Facility' : 'Register Facility'}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel" onClick={handleReset} style={{ flexGrow: '1' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
};

export default AdminFacilities;
