import axios from 'axios';

const API_URL = 'http://localhost:5030/api';

export const fetchAccountInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch account info:', error);
    throw error;
  }
};
