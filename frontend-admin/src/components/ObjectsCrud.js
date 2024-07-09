import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import QRCode from "qrcode.react";
import {
  getAllObjects,
  deleteObject
} from "../api/objectsAPI";
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
  InputLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ObjectsCrud = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const [place, setPlace] = useState("");
  const [totalObjects, setTotalObjects] = useState(0);
  const [newObjectsThisMonth, setNewObjectsThisMonth] = useState(0);
  const [joke, setJoke] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const objs = await getAllObjects(token);
        setData(objs);
        setLoading(false);
        setTotalObjects(objs.length);
        const currentMonth = new Date().getMonth();
        setNewObjectsThisMonth(objs.filter(item => new Date(item.dateAdded).getMonth() === currentMonth).length);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchJoke = async () => {
      try {
        const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
        setJoke(response.data.setup + " " + response.data.punchline);
      } catch (error) {
        console.error("There was an error fetching the joke!", error);
      }
    };
    fetchJoke();
  }, []);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(0); // Reset page to 0 when limit changes
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const currentPageData = data.slice(startIndex, endIndex);

  const handleDeleteObject = async (objectId) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este objeto?");
    if (confirmed) {
      try {
        await deleteObject(objectId, token);
        const objs = await getAllObjects(token);
        setData(objs);
      } catch (error) {
        console.error("Error al eliminar objeto", error);
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
            Stocks and Inventory
          </Typography>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Update stock and inventory table
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <FormControl fullWidth>
                <InputLabel>Lugar</InputLabel>
                <Select value={place} onChange={(e) => setPlace(e.target.value)} label="Lugar">
                  {Array.from(new Set(data.map(item => item.Lugar))).map(lugar => (
                    <MenuItem key={lugar} value={lugar}>{lugar}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="h6">{place ? data.filter(item => item.Lugar === place).length : 0} Objects Available</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">{totalObjects} Total Objects Available</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">{newObjectsThisMonth} New Objects Added This Month</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Interactive Card</Typography>
              <Typography variant="subtitle1">{joke}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Update Inventory Table</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/add-new-item')}>
              Update Inventory
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Stock List</Typography>
              <div className="table-container">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Product ID</th>
                      <th>Location</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <img src={item.imgURL} alt={item.NOMBRE} width="50" />
                        </td>
                        <td>{item.NOMBRE}</td>
                        <td>{item._id}</td>
                        <td>{item.Lugar}</td>
                        <td>{item.isAvailable ? "Available" : "Not Available"}</td>
                        <td>
                          <EditIcon />
                          <DeleteIcon onClick={() => handleDeleteObject(item._id)} />
                        </td>
                      </tr>
                    ))}
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
            <Button variant="contained" onClick={handleNextPage} disabled={endIndex >= data.length}>
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ObjectsCrud;
