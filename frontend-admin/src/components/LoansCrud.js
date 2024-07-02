import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { getAllLoans, addLoan, updateLoan, deleteLoan, readLoan } from '../api/LoansAPI';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Crud.css';

const LoansCrud = ({ token }) => {
  const [loans, setLoans] = useState([]);
  const [newLoan, setNewLoan] = useState({ borrower: '', item: '', dueDate: '' });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const lns = await getAllLoans(token);
      setLoans(lns || []);
    } catch (error) {
      console.error('Error al cargar préstamos', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async () => {
    try {
      await addLoan(newLoan, token);
      setNewLoan({ borrower: '', item: '', dueDate: '' });
      loadLoans();
    } catch (error) {
      console.error('Error al agregar préstamo', error);
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

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Agregar Préstamo</Typography>
              <div className="input-group">
                <TextField
                  fullWidth
                  label="Borrower"
                  value={newLoan.borrower}
                  onChange={(e) => setNewLoan({ ...newLoan, borrower: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Item"
                  value={newLoan.item}
                  onChange={(e) => setNewLoan({ ...newLoan, item: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={newLoan.dueDate}
                  onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button onClick={handleAddLoan} variant="contained" color="primary" style={{ marginTop: '15px' }}>
                  Agregar
                </Button>
              </div>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Lista de Préstamos</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Borrower</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay préstamos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.borrower}</TableCell>
                          <TableCell>{loan.item}</TableCell>
                          <TableCell>{loan.dueDate}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleReadLoan(loan.id)} color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteLoan(loan.id)} color="secondary">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
