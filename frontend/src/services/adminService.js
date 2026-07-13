import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics`, getHeaders());
  return response.data;
};

const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, getHeaders());
  return response.data;
};

const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/users/${id}`, userData, getHeaders());
  return response.data;
};

const getAllComplaints = async (params = {}) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/complaints`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


const assignComplaint = async (id, staffId) => {
  const response = await axios.put(`${API_URL}/complaints/${id}/assign`, { staffId }, getHeaders());
  return response.data;
};

const createFacility = async (facilityData) => {
  const response = await axios.post(`${API_URL}/facilities`, facilityData, getHeaders());
  return response.data;
};

const updateFacility = async (id, facilityData) => {
  const response = await axios.put(`${API_URL}/facilities/${id}`, facilityData, getHeaders());
  return response.data;
};

const deleteFacility = async (id) => {
  const response = await axios.delete(`${API_URL}/facilities/${id}`, getHeaders());
  return response.data;
};

const adminService = {
  getAnalytics,
  getUsers,
  updateUser,
  getAllComplaints,
  assignComplaint,
  createFacility,
  updateFacility,
  deleteFacility
};

export default adminService;
