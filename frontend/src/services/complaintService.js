import axios from 'axios';

const API_URL = '/api/complaints';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getFacilities = async () => {
  const response = await axios.get(`${API_URL}/facilities`, getHeaders());
  return response.data;
};

const createComplaint = async (formData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const getMyComplaints = async (params = {}) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/my`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const getComplaintById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getHeaders());
  return response.data;
};

const getAssignedComplaints = async (params = {}) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/assigned`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


const updateComplaintStatus = async (id, formData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}/status`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const complaintService = {
  getFacilities,
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAssignedComplaints,
  updateComplaintStatus
};

export default complaintService;

