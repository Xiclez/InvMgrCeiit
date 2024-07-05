import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, InputAdornment, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getAllLoans, addLoan, updateLoan, deleteLoan, readLoan } from '../api/LoansAPI'; 
import { getAllUsers, getUserDetails } from '../api/usersAPI';
import { getAllObjects, getObjectDetails } from '../api/objectsAPI'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import './Crud.css';

const LoansCrud = ({ token }) => {
  const [loans, setLoans] = useState([]);
  const [newLoan, setNewLoan] = useState({ userId: '', ceiitId: '', dueDate: '' });
  const [userSearch, setUserSearch] = useState('');
  const [objectSearch, setObjectSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [objectResults, setObjectResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQrReaderOpen, setIsQrReaderOpen] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await getAllLoans(token);
      console.log('API Response:', response); // Log para depurar
      const loansData = response.obj || [];
      console.log('Loans data:', loansData); // Log para depurar

      const detailedLoans = await Promise.all(loansData.map(async (loan) => {
        console.log('Processing loan:', loan); // Log para depurar
        try {
          const userResponse = await getUserDetails(loan.nameUser);
          const objectResponse = await getObjectDetails(loan.nameObj);
          console.log('User fetched:', userResponse); // Log para depurar
          console.log('Object fetched:', objectResponse); // Log para depurar

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
      console.log('Detailed Loans:', detailedLoans); // Log para depurar
      setLoans(detailedLoans);
    } catch (error) {
      console.error('Error al cargar préstamos', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async () => {
    if (userSearch.trim()) {
      const results = await getAllUsers(token);
      setUserResults(results.filter(user => 
        (user.name && user.name.includes(userSearch)) || 
        (user.surName && user.surName.includes(userSearch)) || 
        (user.tuition && user.tuition.toString().includes(userSearch))
      ));
    }
  };

  const handleObjectSearch = async () => {
    if (objectSearch.trim()) {
      const results = await getAllObjects(token);
      setObjectResults(results.filter(object => 
        object.NOMBRE.includes(objectSearch) && object.isAvailable
      ));
    }
  };

  const handleSelectUser = (user) => {
    setNewLoan({ ...newLoan, userId: user._id });
    setUserSearch(`${user.name} ${user.surName} (${user.tuition})`);
    setUserResults([]);
  };

  const handleSelectObject = (object) => {
    setNewLoan({ ...newLoan, ceiitId: object._id });
    setObjectSearch(object.NOMBRE);
    setObjectResults([]);
  };

  const handleAddLoan = async () => {
    try {
      await addLoan(newLoan, token);
      setNewLoan({ userId: '', ceiitId: '', dueDate: '' });
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

  const handleScanQR = async (data) => {
    if (data) {
      setIsQrReaderOpen(false);
      try {
        const object = await getObjectDetails(data);
        if (!object.isAvailable) {
          alert("Este objeto se encuentra bajo prestamo, por favor cierra el prestamo activo");
        } else {
          setNewLoan({ ...newLoan, ceiitId: data });
          setObjectSearch(object.NOMBRE);
        }
      } catch (error) {
        console.error('Error fetching object details:', error);
      }
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
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onBlur={handleUserSearch}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleUserSearch}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <List>
                  {userResults.map(user => (
                    <ListItem button onClick={() => handleSelectUser(user)} key={user._id}>
                      <ListItemText primary={`${user.name} ${user.surName} (${user.tuition})`} />
                    </ListItem>
                  ))}
                </List>

                <TextField
                  fullWidth
                  label="Item"
                  value={objectSearch}
                  onChange={(e) => setObjectSearch(e.target.value)}
                  onBlur={handleObjectSearch}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleObjectSearch}>
                          <SearchIcon />
                        </IconButton>
                        <IconButton onClick={() => setIsQrReaderOpen(true)}>
                          <CameraAltIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <List>
                  {objectResults.map(object => (
                    <ListItem button onClick={() => handleSelectObject(object)} key={object._id}>
                      <ListItemText primary={object.NOMBRE} />
                    </ListItem>
                  ))}
                </List>
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

      <Dialog open={isQrReaderOpen} onClose={() => setIsQrReaderOpen(false)}>
        <DialogTitle>Escanea el QR del objeto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Asegúrate de que el código QR del objeto esté visible en la cámara.
          </DialogContentText>
          <QrReader
            onResult={(result, error) => {
              if (!!result) {
                handleScanQR(result?.text);
              }

              if (!!error) {
                console.info(error);
              }
            }}
            style={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsQrReaderOpen(false)} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoansCrud;
