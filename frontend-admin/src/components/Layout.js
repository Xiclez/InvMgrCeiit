import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Divider, Box } from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Home as HomeIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';

const drawerWidth = 240;

const Layout = ({ username, onLogout }) => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
          <div style={{ marginLeft: 'auto' }}>
            Hola {username}! <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <div>
          <IconButton onClick={handleDrawerOpen}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
            <br />
          <ListItem button component={Link} to="/objects">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Objetos" />
          </ListItem>
          <ListItem button component={Link} to="/loans">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Préstamos" />
          </ListItem>
          <ListItem button component={Link} to="/users">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItem>
          <Divider />
          <ListItem button onClick={onLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, transition: (theme) => theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }), marginLeft: `-${drawerWidth}px`, ...(open && {
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        }) }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
