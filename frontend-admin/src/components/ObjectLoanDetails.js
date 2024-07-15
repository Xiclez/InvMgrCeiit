import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Grid, Paper } from '@mui/material';
import axios from 'axios';

const ObjectLoanDetails = ({ token }) => {
  const { id } = useParams();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [objectDetails, setObjectDetails] = useState(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const loanResponse = await axios.get(`http://ulsaceiit.xyz/ulsa/getLoanByObjectId?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const loanData = loanResponse.data;
        setLoans(loanData);

        const userIds = new Set();
        loanData.forEach(loan => userIds.add(loan.nameUser));

        const userDetailsPromises = Array.from(userIds).map(async userId => {
          const userResponse = await axios.get('http://ulsaceiit.xyz/users/buscar_usuario', {
            params: { id: userId },
            headers: { Authorization: `Bearer ${token}` }
          });
          return userResponse.data.usuarios[0];
        });

        const objectResponse = await axios.get('http://ulsaceiit.xyz/ulsa/searchObject', {
          params: { id: loanData[0].nameObj },
          headers: { Authorization: `Bearer ${token}` }
        });
        const objectData = objectResponse.data;
        setObjectDetails(objectData);

        const userDetailsArray = await Promise.all(userDetailsPromises);

        const userDetailsMap = {};
        userDetailsArray.forEach(user => {
          userDetailsMap[user._id] = user;
        });

        setUserDetails(userDetailsMap);
        console.log("Loan details:", loanData);
        console.log("User details:", userDetailsMap);
        console.log("Object details:", objectData);
      } catch (error) {
        console.error('Error fetching loan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id, token]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!loans.length || !objectDetails) {
    return <Typography variant="h6">Préstamo no encontrado</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" component="div" gutterBottom>
        Detalles del Préstamo
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <img src={objectDetails.imgURL} alt={objectDetails.NOMBRE} width="100%" />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Paper>
            <Box p={2}>
              <div className="table-container">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>Nombre del Usuario</th>
                      <th>Apellido del Usuario</th>
                      <th>Matrícula del Usuario</th>
                      <th>Nombre del Objeto</th>
                      <th>Fecha de Apertura</th>
                      <th>Fecha de Cierre</th>
                      <th>Estado</th>
                      <th>Contrato de Cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan, index) => (
                      <tr key={loan._id}>
                        <td>{index + 1}</td>
                        <td>{userDetails[loan.nameUser]?.name}</td>
                        <td>{userDetails[loan.nameUser]?.surName}</td>
                        <td>{userDetails[loan.nameUser]?.tuition}</td>
                        <td>{objectDetails.NOMBRE}</td>
                        <td>{new Date(loan.date).toLocaleString()}</td>
                        <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleString() : 'N/A'}</td>
                        <td>{loan.status ? 'Activo' : 'Inactivo'}</td>
                        <td>
                          <a href={loan.linkCloseLoan} target="_blank" rel="noopener noreferrer">
                            Link del contrato de cierre
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ObjectLoanDetails;
