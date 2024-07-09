import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import QRCode from "qrcode.react";
import {
  getAllObjects,
  addObject,
  updateObject,
  deleteObject,
  readObject,
  uploadImageToCloudinary,
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
  InputLabel,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

Modal.setAppElement("#root");

const ObjectsCrud = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [newObject, setNewObject] = useState({ NOMBRE: "", Lugar: "", imgURL: "" });
  const [qrCodeId, setQrCodeId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const objs = await getAllObjects(token);
        setData(objs);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

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

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const response = await uploadImageToCloudinary(file);
      console.log('Response from Cloudinary:', response); // Debugging line
      if (response && response.secure_url) {
        setNewObject((prevObject) => ({ ...prevObject, imgURL: response.secure_url }));
      } else {
        console.error("No se pudo obtener la URL segura de la respuesta de Cloudinary.");
      }
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddObject = async () => {
    try {
      const response = await addObject(newObject, token);
      setNewObject({ NOMBRE: "", Lugar: "", imgURL: "" });
      setIsModalOpen(false);
      setQrCodeId(response.obj._id); // Set the QR code ID
      setIsQrModalOpen(true); // Open the QR modal
      const objs = await getAllObjects(token);
      setData(objs);
    } catch (error) {
      console.error("Error al agregar objeto", error);
    }
  };

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

  const downloadQRCode = () => {
    const canvas = document.getElementById("qrCode");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${qrCodeId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
              <Typography variant="h6">10 Categories</Typography>
              <Typography variant="subtitle2">2 more than last year</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">300 Total items</Typography>
              <Typography variant="subtitle2">10 more than last year</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">₦250,000,000 Total item cost</Typography>
              <Typography variant="subtitle2">2.5% less than last year</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">20 Total suppliers</Typography>
              <Typography variant="subtitle2">2 more than last week</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Update Inventory Table</Typography>
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Agregar Objeto"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Agregar Objeto</h2>
        <div className="input-group">
          <TextField
            fullWidth
            label="Nombre"
            value={newObject.NOMBRE}
            onChange={(e) => setNewObject({ ...newObject, NOMBRE: e.target.value })}
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              style: { color: 'black' },
            }}
          />
          <TextField
            fullWidth
            label="Lugar"
            value={newObject.Lugar}
            onChange={(e) => setNewObject({ ...newObject, Lugar: e.target.value })}
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              style: { color: 'black' },
            }}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={newObject.imgURL}
            InputProps={{
              readOnly: !manualUrl,
            }}
            onChange={(e) => setNewObject({ ...newObject, imgURL: e.target.value })}
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              style: { color: 'black' },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={manualUrl}
                onChange={(e) => setManualUrl(e.target.checked)}
              />
            }
            label="Introducir URL manualmente"
            style={{ marginTop: '15px' }}
          />
          {!manualUrl && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                style={{ marginTop: '15px' }}
              />
              {uploading && <CircularProgress style={{ marginTop: '15px' }} />}
            </div>
          )}
          <Button
            onClick={handleAddObject}
            variant="contained"
            color="primary"
            style={{ marginTop: '15px' }}
            disabled={uploading || (!newObject.imgURL && !manualUrl)}
          >
            Agregar
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={() => setIsQrModalOpen(false)}
        contentLabel="Código QR"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Código QR Generado</h2>
        <div className="qr-code-container">
          <QRCode id="qrCode" value={qrCodeId} size={256} level={"H"} includeMargin={true} />
        </div>
        <Button onClick={downloadQRCode} variant="contained" color="primary" style={{ marginTop: '15px' }}>
          Descargar QR
        </Button>
        <Button onClick={() => window.print()} variant="contained" color="primary" style={{ marginTop: '15px' }}>
          Imprimir QR
        </Button>
      </Modal>
    </Container>
  );
};

export default ObjectsCrud;
