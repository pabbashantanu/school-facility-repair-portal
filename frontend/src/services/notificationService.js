import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getMyNotifications = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

const markAsRead = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/read`, {}, getHeaders());
  return response.data;
};

const markAllAsRead = async () => {
  const response = await axios.put(`${API_URL}/read-all`, {}, getHeaders());
  return response.data;
};

const notificationService = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};

export default notificationService;
