import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { getAllUsers, deleteUser, readUser } from '../api/usersAPI';

const UsersCrud = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllUsers(token);
        setUsers(users);
        setTotalUsers(users.length);
        const currentMonth = new Date().getMonth();
        setNewUsersThisMonth(users.filter(user => new Date(user.dateAdded).getMonth() === currentMonth).length);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener usuarios', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmed) {
      try {
        await deleteUser(userId, token);
        const users = await getAllUsers(token);
        setUsers(users);
        setTotalUsers(users.length);
        const currentMonth = new Date().getMonth();
        setNewUsersThisMonth(users.filter(user => new Date(user.dateAdded).getMonth() === currentMonth).length);
      } catch (error) {
        console.error('Error al eliminar usuario', error);
      }
    }
  };

  const handleReadUser = async (userId) => {
    try {
      const user = await readUser(userId, token);
      setSelectedUser(user);
    } catch (error) {
      console.error('Error al leer usuario', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(0);
    if (query.trim() === '') {
      const users = await getAllUsers(token);
      setUsers(users);
    } else {
      const users = await getAllUsers(token);
      const lowerQuery = query.toLowerCase();
      const filteredUsers = users.filter((user) =>
        (user.username && user.username.toLowerCase().includes(lowerQuery)) ||
        (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
        (user.surName && user.surName.toLowerCase().includes(lowerQuery)) ||
        (user.tuition && user.tuition.toString().includes(lowerQuery)) ||
        (user.role && user.role.toLowerCase().includes(lowerQuery))
      );
      setUsers(filteredUsers);
    }
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(0);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const currentPageData = users.slice(startIndex, endIndex);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="div" gutterBottom>
            Users Management
          </Typography>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Update users table
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">{totalUsers} Total Users</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">{newUsersThisMonth} New Users This Month</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleSearch(searchQuery)}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              margin="normal"
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => navigate('/add-new-user')}>
              Add New User
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Users List</Typography>
              <div className="table-container">
                <table className="crud-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Tuition</th>
                      <th>Name</th>
                      <th>Surname</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.length > 0 ? (
                      currentPageData.map((user, index) => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.tuition}</td>
                          <td>{user.name}</td>
                          <td>{user.surName}</td>
                          <td>{user.role}</td>
                          <td>
                            <IconButton onClick={() => handleReadUser(user._id)} color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteUser(user._id)} color="secondary">
                              <DeleteIcon />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <FormControl variant="outlined" size="small">
            <InputLabel>Results per page</InputLabel>
            <Select value={limit} onChange={handleLimitChange} label="Results per page">
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Button variant="contained" onClick={handlePrevPage} disabled={page === 0}>
              Previous
            </Button>
            <Button variant="contained" onClick={handleNextPage} disabled={endIndex >= users.length}>
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UsersCrud;
