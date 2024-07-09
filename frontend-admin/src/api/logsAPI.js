import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/dev';

export const getAllLogs = async (token) => {
  const response = await axios.get(`${API_URL}/getAllLogs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
