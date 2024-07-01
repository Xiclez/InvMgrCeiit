import axios from 'axios';

const API_URL = 'http://ulsaceiit.xyz/ulsa'; // Reemplaza {apiURL} con la URL de tu servidor

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAllLoans = async (token) => {
  const response = await axios.get(`${API_URL}/getAllLoans`, getConfig(token));
  return response.data.loans;
};

export const addLoan = async (loan, token) => {
  const response = await axios.post(`${API_URL}/addLoan`, loan, getConfig(token));
  return response.data.loan;
};

export const updateLoan = async (loan, token) => {
  const response = await axios.post(`${API_URL}/updateLoan`, loan, getConfig(token));
  return response.data.loan;
};

export const deleteLoan = async (loanId, token) => {
  const response = await axios.post(`${API_URL}/deleteLoan`, { id: loanId }, getConfig(token));
  return response.data.loan;
};

export const readLoan = async (loanId, token) => {
  const response = await axios.post(`${API_URL}/readLoan`, { id: loanId }, getConfig(token));
  return response.data.loan;
};
