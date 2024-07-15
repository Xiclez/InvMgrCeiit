import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/ulsa'; 
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dn4m0kr7j/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'ulsaceiit';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const searchObjects = async (query, token) => {
  try {
    const response = await axios.get(`${API_URL}/searchObject`, {
      params: { query },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error searching objects:', error);
    throw error;
  }
};

export const getObjectDetails = async (objectId) => {
  try {
    const response = await axios.get(`${API_URL}/searchObject`, {
      params: { id: objectId }
    });
    console.log('getObjectDetails response:', response.data); // Log para depurar
    return response.data;
  } catch (error) {
    console.error('Error fetching object details:', error);
    return null;
  }
};

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(CLOUDINARY_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Cloudinary response:', response.data); // Debugging line
  return response.data;
};

export const getAllObjects = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/getAllObjects`, config);
  return response.data.objs;
};


export const addObject = async (newObject, token) => {
  const response = await axios.post(`${API_URL}/addObject`, {
    ob: newObject.NOMBRE,
    ubi: newObject.Lugar,
    esta: true, 
    imgURL: newObject.imgURL,
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const updateObject = async (object, token) => {
  const response = await axios.post(`${API_URL}/updateObject`, object, getConfig(token));
  return response.data.obj;
};

export const deleteObject = async (objectId, token) => {
  const response = await axios.post(`${API_URL}/deleteObject`, { id: objectId }, getConfig(token));
  return response.data.obj;
};

export const readObject = async (objectName, token) => {
  const response = await axios.post(`${API_URL}/readObject`, { ob: objectName }, getConfig(token));
  return response.data.obj;
};
