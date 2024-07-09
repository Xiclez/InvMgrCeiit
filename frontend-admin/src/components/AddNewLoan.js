import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, InputAdornment, IconButton, List, ListItem, ListItemText, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { getAllUsers, getUserDetails } from '../api/usersAPI';
import { getAllObjects, getObjectDetails } from '../api/objectsAPI'; 
import { addLoan } from '../api/LoansAPI';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { QrReader } from 'react-qr-reader';

const AddNewLoan = ({ token, onBack }) => {
  const [newLoan, setNewLoan] = useState({ userId: '', ceiitId: '', dueDate: '' });
  const [userSearch, setUserSearch] = useState('');
  const [objectSearch, setObjectSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [objectResults, setObjectResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isQrReaderOpen, setIsQrReaderOpen] = useState(false);

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
    setLoading(true);
    try {
      await addLoan(newLoan, token);
      setNewLoan({ userId: '', ceiitId: '', dueDate: '' });
      onBack();
    } catch (error) {
      console.error('Error al agregar préstamo', error);
    } finally {
      setLoading(false);
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

  return (
    <Container>
      <Typography variant="h4" component="div" gutterBottom>
        Agregar Préstamo
      </Typography>
      <Box>
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

        <Button
          onClick={handleAddLoan}
          variant="contained"
          color="primary"
          style={{ marginTop: '15px' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Agregar'}
        </Button>

        <Button
          onClick={onBack}
          variant="contained"
          color="secondary"
          style={{ marginTop: '15px', marginLeft: '10px' }}
        >
          Cancelar
        </Button>
      </Box>

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

export default AddNewLoan;
