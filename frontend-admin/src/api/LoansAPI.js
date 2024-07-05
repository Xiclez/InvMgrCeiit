import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/ulsa'; 

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAllLoans = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/getAllLoans`, getConfig(token));
    console.log('getAllLoans response:', response.data); // Log para depurar
    return response.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
    return { obj: [] }; // Devuelve un array vacío en caso de error
  }
};

export const addLoan = async (loan, token) => {
  try {
    const response = await axios.post(`${API_URL}/loanObject`, loan, getConfig(token));
    return response.data.loan;
  } catch (error) {
    console.error('Error adding loan:', error);
    throw error;
  }
};

export const updateLoan = async (loan, token) => {
  try {
    const response = await axios.post(`${API_URL}/updateLoan`, loan, getConfig(token));
    return response.data.loan;
  } catch (error) {
    console.error('Error updating loan:', error);
    throw error;
  }
};

export const deleteLoan = async (loanId, token) => {
  try {
    const response = await axios.post(`${API_URL}/deleteLoan`, { id: loanId }, getConfig(token));
    return response.data.loan;
  } catch (error) {
    console.error('Error deleting loan:', error);
    throw error;
  }
};

export const readLoan = async (loanId, token) => {
  try {
    const response = await axios.post(`${API_URL}/readLoan`, { id: loanId }, getConfig(token));
    return response.data.loan;
  } catch (error) {
    console.error('Error reading loan:', error);
    throw error;
  }
};
