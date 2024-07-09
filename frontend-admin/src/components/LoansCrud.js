import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, TextField } from '@mui/material';
import { getAllLoans, deleteLoan, readLoan, updateLoan } from '../api/LoansAPI'; 
import { getUserDetails } from '../api/usersAPI';
import { getObjectDetails } from '../api/objectsAPI'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import './Crud.css';

const LoansCrud = ({ token }) => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await getAllLoans(token);
      const loansData = response.obj || [];

      const detailedLoans = await Promise.all(loansData.map(async (loan) => {
        try {
          const userResponse = await getUserDetails(loan.nameUser);
          const objectResponse = await getObjectDetails(loan.nameObj);

          const user = userResponse && userResponse.usuarios ? userResponse.usuarios.find(u => u._id === loan.nameUser) : null;
          const object = objectResponse;

          return {
            ...loan,
            userName: user ? user.name : 'N/A',
            userApellido: user ? user.surName : 'N/A',
            userMatricula: user ? user.tuition : 'N/A',
            objectName: object ? object.NOMBRE : 'N/A',
            imgURL: object ? object.imgURL : '',
          };
        } catch (error) {
          console.error('Error fetching user or object data:', error);
          return loan;
        }
      }));

      setLoans(detailedLoans);
    } catch (error) {
      console.error('Error al cargar préstamos', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async (loanId) => {
    try {
      await deleteLoan(loanId, token);
      loadLoans();
    } catch (error) {
      console.error('Error al eliminar préstamo', error);
    }
  };

  const handleReadLoan = async (loanId) => {
    try {
      const loan = await readLoan(loanId, token);
      setSelectedLoan(loan);
    } catch (error) {
      console.error('Error al leer préstamo', error);
    }
  };

  const handleCloseLoan = async (loanId) => {
    try {
      await axios.post('http://ulsaceiit.xyz/ulsa/returnLoan', {
        loanId,
        linkCloseLoan: 'file:///data/user/0/host.exp.exponent/files/return_contract_1719959823139.pdf' // Asegúrate de cambiar esto a la URL correcta
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadLoans();
    } catch (error) {
      console.error('Error al cerrar préstamo', error);
    }
  };

  const handleUpdateLoan = async () => {
    if (selectedLoan) {
      try {
        await updateLoan(selectedLoan, token);
        setSelectedLoan(null);
        loadLoans();
      } catch (error) {
        console.error('Error al actualizar préstamo', error);
      }
    }
  };

  const handleNavigateToAddLoan = () => {
    navigate('/add-new-loan');
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="div" gutterBottom>
            Préstamos
          </Typography>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Gestión de préstamos
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Préstamos Activos</Typography>
              <Typography variant="subtitle2">{loans.filter(loan => loan.status).length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Préstamos del Mes</Typography>
              <Typography variant="subtitle2">{loans.filter(loan => new Date(loan.date).getMonth() === new Date().getMonth()).length}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Lista de Préstamos</Typography>
            <Button variant="contained" color="primary" onClick={handleNavigateToAddLoan}>
              Agregar Préstamo
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Apellido</TableCell>
                      <TableCell>Matrícula</TableCell>
                      <TableCell>Objeto</TableCell>
                      <TableCell>Imagen</TableCell>
                      <TableCell>Fecha Apertura</TableCell>
                      <TableCell>Fecha Cierre</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan._id}>
                        <TableCell>{loan.userName}</TableCell>
                        <TableCell>{loan.userApellido}</TableCell>
                        <TableCell>{loan.userMatricula}</TableCell>
                        <TableCell>{loan.objectName}</TableCell>
                        <TableCell><img src={loan.imgURL} alt={loan.objectName} width="50" /></TableCell>
                        <TableCell>{new Date(loan.date).toLocaleString()}</TableCell>
                        <TableCell>{loan.returnDate ? new Date(loan.returnDate).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{loan.status ? 'Activo' : 'Inactivo'}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleReadLoan(loan._id)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteLoan(loan._id)} color="secondary">
                            <DeleteIcon />
                          </IconButton>
                          {loan.status && (
                            <Button onClick={() => handleCloseLoan(loan._id)} variant="contained" color="secondary" style={{ marginTop: '5px' }}>
                              Cerrar Préstamo
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {selectedLoan && (
          <Grid item xs={12}>
            <Paper>
              <Box p={2}>
                <Typography variant="h6">Editar Préstamo</Typography>
                <div className="input-group">
                  <TextField
                    fullWidth
                    label="Borrower"
                    value={selectedLoan.borrower}
                    readOnly
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Item"
                    value={selectedLoan.item}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, item: e.target.value })}
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={selectedLoan.dueDate}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, dueDate: e.target.value })}
                    variant="outlined"
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Button onClick={handleUpdateLoan} variant="contained" color="primary" style={{ marginTop: '15px' }}>
                    Actualizar
                  </Button>
                </div>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default LoansCrud;
