import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import './ReportIssue.css';

const ReportIssue = () => {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    facility: '',
    severity: 'Medium'
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilitiesList = async () => {
      try {
        const res = await complaintService.getFacilities();
        setFacilities(res.data);
      } catch (err) {
        setError('Failed to fetch school facilities');
      }
    };
    fetchFacilitiesList();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check limits
    if (files.length + selectedFiles.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    setFiles([...files, ...selectedFiles]);
    
    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews([...filePreviews, ...newPreviews]);
    setError('');
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...filePreviews];
    newPreviews.splice(index, 1);
    setFilePreviews(newPreviews);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.facility) errors.facility = 'Please select a facility';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('facility', formData.facility);
    submissionData.append('severity', formData.severity);
    files.forEach(file => {
      submissionData.append('images', file);
    });

    try {
      await complaintService.createComplaint(submissionData);
      setLoading(false);
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-container">
      <div className="page-header">
        <h2>Report Damaged Facility</h2>
        <p>Provide details of the maintenance issue. Our staff will investigate and resolve it.</p>
      </div>

      <div className="form-card">
        {error && <div className="error-alert">⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Issue Title</label>
            <input
              type="text"
              id="title"
              className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Broken AC Unit, Flickering Lights"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {validationErrors.title && <span className="error-text">{validationErrors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="facility">Facility Location</label>
              <select
                id="facility"
                className={`form-control ${validationErrors.facility ? 'is-invalid' : ''}`}
                value={formData.facility}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Facility --</option>
                {facilities.map(fac => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.building})
                  </option>
                ))}
              </select>
              {validationErrors.facility && <span className="error-text">{validationErrors.facility}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity Level</label>
              <select
                id="severity"
                className="form-control"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="Low">Low (Minor inconvenience)</option>
                <option value="Medium">Medium (Disruptive, but safe)</option>
                <option value="High">High (Requires prompt fix)</option>
                <option value="Critical">Critical (Safety hazard / total failure)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              rows="5"
              className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
              placeholder="Provide context e.g. exact room location, noises, when the issue started..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
            {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
          </div>

          <div className="form-group">
            <label>Upload Proof Images (Max 5)</label>
            <div className="file-upload-zone">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={files.length >= 5}
              />
              <span className="upload-icon">📷</span>
              <p>Click or drag images to upload</p>
            </div>
            
            {filePreviews.length > 0 && (
              <div className="previews-grid">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <img src={preview} alt={`upload preview ${index}`} />
                    <button type="button" className="remove-preview-btn" onClick={() => removeFile(index)}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
