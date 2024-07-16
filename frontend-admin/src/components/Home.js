import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/logoInvMgr.png';
import './Home.css';

const Home = ({ username }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <img src={logo} alt="Logo" className="top-center-logo" />
      </Box>
      <Typography variant="h4" gutterBottom>
        ¡Bienvenido, {username}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Gestión de Objetos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra y organiza todos los objetos de la empresa.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/objects" sx={{ mt: 2 }}>
                Ver Objetos
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Gestión de Préstamos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra los préstamos de objetos a los usuarios.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/loans" sx={{ mt: 2 }}>
                Ver Préstamos
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Gestión de Usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra los usuarios del sistema.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/users" sx={{ mt: 2 }}>
                Ver Usuarios
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Logs del Sistema
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revisa los logs para el seguimiento de actividades.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/logs" sx={{ mt: 2 }}>
                Ver Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
