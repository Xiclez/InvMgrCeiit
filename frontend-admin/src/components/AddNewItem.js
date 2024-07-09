import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import QRCode from 'qrcode.react';
import { addObject, uploadImageToCloudinary } from '../api/objectsAPI';

const AddNewItem = ({ token, setData }) => {
  const [newObject, setNewObject] = useState({ NOMBRE: '', Lugar: '', imgURL: '' });
  const [qrCodeId, setQrCodeId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const response = await uploadImageToCloudinary(file);
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
    setLoading(true);
    try {
      const response = await addObject(newObject, token);
      setNewObject({ NOMBRE: '', Lugar: '', imgURL: '' });
      setQrCodeId(response.obj._id);
      //const objs = await getAllObjects(token);
      //setData(objs);
    } catch (error) {
      console.error("Error al agregar objeto", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qrCode");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${qrCodeId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="div" gutterBottom>
            Add New Item
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6">Item Details</Typography>
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
                  disabled={uploading || (!newObject.imgURL && !manualUrl) || loading}
                >
                  Agregar
                </Button>
              </div>
            </Box>
          </Paper>
        </Grid>

        {qrCodeId && (
          <Grid item xs={12}>
            <Paper>
              <Box p={2}>
                <Typography variant="h6">QR Code</Typography>
                <div className="qr-code-container">
                  <QRCode id="qrCode" value={qrCodeId} size={256} level={"H"} includeMargin={true} />
                </div>
                <Button onClick={downloadQRCode} variant="contained" color="primary" style={{ marginTop: '15px' }}>
                  Descargar QR
                </Button>
                <Button onClick={() => window.print()} variant="contained" color="primary" style={{ marginTop: '15px' }}>
                  Imprimir QR
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AddNewItem;
