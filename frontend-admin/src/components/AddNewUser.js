import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { addUser } from '../api/usersAPI';

const AddNewUser = ({ token }) => {
  const [newUser, setNewUser] = useState({ username: '', password: '', tuition: '', name: '', surName: '', role: 'Usuario' });
  const navigate = useNavigate();

  const handleAddUser = async () => {
    try {
      await addUser(newUser, token);
      setNewUser({ username: '', password: '', tuition: '', name: '', surName: '', role: 'Usuario' });
      navigate('/users');
    } catch (error) {
      console.error('Error al agregar usuario', error);
    }
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="div" gutterBottom>
            Add New User
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <div className="input-group">
                <TextField
                  fullWidth
                  label="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Tuition"
                  value={newUser.tuition}
                  onChange={(e) => setNewUser({ ...newUser, tuition: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Surname"
                  value={newUser.surName}
                  onChange={(e) => setNewUser({ ...newUser, surName: e.target.value })}
                  variant="outlined"
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Desarrollador">Desarrollador</MenuItem>
                    <MenuItem value="Usuario">Usuario</MenuItem>
                  </Select>
                </FormControl>
                <Button onClick={handleAddUser} variant="contained" color="primary" style={{ marginTop: '15px' }}>
                  Add
                </Button>
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddNewUser;
