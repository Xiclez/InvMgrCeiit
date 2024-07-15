import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/users'; // Asegúrate de que esta URL sea correcta

export const getAllUsers = async (token) => {
  const response = await axios.get(`${API_URL}/buscar_usuario`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.usuarios || []; // Ajusta según la estructura de la respuesta del backend
};

export const searchUsers = async (query, token) => {
  try {
    const response = await axios.get(`${API_URL}/buscar_usuario`, {
      params: { query },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.usuarios || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/buscar_usuario`, {
      params: { id: userId }
    });
    console.log('getUserDetails response:', response.data); // Log para depurar
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

export const addUser = async (newUser, token) => {
  const response = await axios.post(`${API_URL}/registrar`, {
    usrn: newUser.username,
    password: newUser.password,
    tuition: newUser.tuition,
    name: newUser.name,
    surName: newUser.surName,
    role: newUser.role
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const updateUser = async (updatedUser, token) => {
  const response = await axios.put(`${API_URL}/${updatedUser._id}`, updatedUser, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const deleteUser = async (userId, token) => {
  const response = await axios.delete(`${API_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const readUser = async (userId, token) => {
  const response = await axios.get(`${API_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
