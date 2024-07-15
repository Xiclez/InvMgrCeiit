import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, List, ListItem, ListItemText,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { getAllLoans, deleteLoan, readLoan, updateLoan } from '../api/LoansAPI';
import { getUserDetails, getAllUsers } from '../api/usersAPI';
import { getAllObjects, getObjectDetails } from '../api/objectsAPI';
import './Crud.css';

const LoansCrud = ({ token }) => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [objectSearch, setObjectSearch] = useState('');
  const [objectResults, setObjectResults] = useState([]);
  const [isQrReaderOpen, setIsQrReaderOpen] = useState(false);
  const [showActiveLoans, setShowActiveLoans] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [editObjectSearch, setEditObjectSearch] = useState('');
  const [editObjectResults, setEditObjectResults] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
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

  const handleObjectSearch = async () => {
    if (objectSearch.trim()) {
      const results = await getAllObjects(token);
      setObjectResults(results.filter(object =>
        object.NOMBRE.includes(objectSearch)
      ));
    }
  };

  const handleEditObjectSearch = async () => {
    if (editObjectSearch.trim()) {
      const results = await getAllObjects(token);
      setEditObjectResults(results.filter(object =>
        object.NOMBRE.includes(editObjectSearch)
      ));
    }
  };

  const handleUserSearch = async () => {
    if (userSearch.trim()) {
      const results = await getAllUsers(token);
      setUserResults(results.filter(user =>
        user.name.includes(userSearch) || user.surName.includes(userSearch) || (user.tuition && user.tuition.toString().includes(userSearch))
      ));
    }
  };

  const handleScanQR = async (data) => {
    if (data) {
      setIsQrReaderOpen(false);
      try {
        const object = await getObjectDetails(data);
        setObjectSearch(object.NOMBRE);
        setObjectResults([object]);
      } catch (error) {
        console.error('Error fetching object details:', error);
      }
    }
  };

  const handleSelectObject = (object) => {
    setSelectedLoan({
      ...selectedLoan,
      nameObj: object._id,
      objectName: object.NOMBRE,
    });
    setEditObjectResults([]);
  };

  const handleSelectUser = (user) => {
    setSelectedLoan({
      ...selectedLoan,
      nameUser: user._id,
      userName: user.name,
      userApellido: user.surName,
      userMatricula: user.tuition,
    });
    setUserResults([]);
  };

  const handleDeleteLoan = async () => {
    if (loanToDelete) {
      try {
        await deleteLoan(loanToDelete._id, token);
        setDeleteDialogOpen(false);
        setLoanToDelete(null);
        loadLoans();
      } catch (error) {
        console.error('Error al eliminar préstamo', error);
      }
    }
  };

  const handleOpenDeleteDialog = (loan) => {
    setLoanToDelete(loan);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLoanToDelete(null);
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
        linkCloseLoan: 'file:///data/user/0/host.exp.exponent/files/return_contract_1719959823139.pdf'
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
        await updateLoan({
          loanId: selectedLoan._id,
          userId: selectedLoan.nameUser,
          ceiitId: selectedLoan.nameObj,
          linkOpenLoan: selectedLoan.linkOpenLoan,
          linkCloseLoan: selectedLoan.linkCloseLoan,
          status: selectedLoan.status, 
          observaciones: selectedLoan.observaciones  
        }, token);
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

  const handleToggleLoans = () => {
    setShowActiveLoans(!showActiveLoans);
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              fullWidth
              label="Buscar Objeto"
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
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <List>
            {objectResults.map(object => (
              <ListItem button onClick={() => navigate(`/object-loan-details/${object._id}`)} key={object._id}>
                <ListItemText primary={object.NOMBRE} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={!showActiveLoans} onChange={handleToggleLoans} color="primary" />}
            label="Mostrar Préstamos Inactivos"
          />
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
                    {loans
                      .filter(loan => showActiveLoans ? loan.status : !loan.status)
                      .map((loan) => (
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
                            <IconButton onClick={() => handleOpenDeleteDialog(loan)} color="secondary">
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
                    label="Fecha de Apertura"
                    value={selectedLoan.date ? new Date(selectedLoan.date).toLocaleString() : ''}
                    readOnly
                    variant="outlined"
                    margin="normal"
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <TextField
                      fullWidth
                      label="Buscar Usuario"
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
                  </Box>
                  <List>
                    {userResults.map(user => (
                      <ListItem button onClick={() => handleSelectUser(user)} key={user._id}>
                        <ListItemText primary={`${user.name} ${user.surName} (${user.tuition})`} />
                      </ListItem>
                    ))}
                  </List>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <TextField
                      fullWidth
                      label="Buscar Objeto"
                      value={editObjectSearch}
                      onChange={(e) => setEditObjectSearch(e.target.value)}
                      onBlur={handleEditObjectSearch}
                      variant="outlined"
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleEditObjectSearch}>
                              <SearchIcon />
                            </IconButton>
                            <IconButton onClick={() => setIsQrReaderOpen(true)}>
                              <CameraAltIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <List>
                    {editObjectResults.map(object => (
                      <ListItem button onClick={() => handleSelectObject(object)} key={object._id}>
                        <ListItemText primary={object.NOMBRE} />
                      </ListItem>
                    ))}
                  </List>
                  <TextField
                    fullWidth
                    label="Link de Apertura"
                    value={selectedLoan.linkOpenLoan}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, linkOpenLoan: e.target.value })}
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Link de Cierre"
                    value={selectedLoan.linkCloseLoan}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, linkCloseLoan: e.target.value })}
                    variant="outlined"
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Estado</InputLabel>
                    <Select
                      labelId="status-label"
                      value={selectedLoan.status ? 'activo' : 'inactivo'}
                      onChange={(e) => setSelectedLoan({ ...selectedLoan, status: e.target.value === 'activo' })}
                    >
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    value={selectedLoan.observaciones}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, observaciones: e.target.value })}
                    variant="outlined"
                    margin="normal"
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

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este préstamo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteLoan} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoansCrud;
