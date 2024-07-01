import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/ulsa'; 

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAllObjects = async (token) => {
  const response = await axios.get(`${API_URL}/getAllObjects`, {}, getConfig(token));
  return response.data.objs;
};

export const addObject = async (newObject, token) => {
  const response = await axios.post(`${API_URL}/addObject`, {
    ob: newObject.NOMBRE,
    ubi: newObject.Lugar,
    esta: newObject.isAvailable
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const updateObject = async (object, token) => {
  const response = await axios.post(`${API_URL}/updateObject`, object, getConfig(token));
  return response.data.obj;
};

export const deleteObject = async (objectName, token) => {
  const response = await axios.post(`${API_URL}/deleteObject`, { ob: objectName }, getConfig(token));
  return response.data.obj;
};

export const readObject = async (objectName, token) => {
  const response = await axios.post(`${API_URL}/readObject`, { ob: objectName }, getConfig(token));
  return response.data.obj;
};
