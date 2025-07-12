
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bugs';

const getBugs = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createBug = async (bugData) => {
  const response = await axios.post(API_URL, bugData);
  return response.data;
};

const updateBug = async (bugId, bugData) => {
  const response = await axios.put(`${API_URL}/${bugId}`, bugData);
  return response.data;
};

const deleteBug = async (bugId) => {
  const response = await axios.delete(`${API_URL}/${bugId}`);
  return response.data;
};

const bugService = {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
};

export default bugService;
