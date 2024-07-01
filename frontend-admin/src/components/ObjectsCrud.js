import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';
import {
  getAllObjects,
  addObject,
  updateObject,
  deleteObject,
  readObject
} from '../api/objectsAPI';
import './Crud.css';

Modal.setAppElement('#root');

const ObjectsCrud = ({ token }) => {
  const [objects, setObjects] = useState([]);
  const [newObject, setNewObject] = useState({ NOMBRE: '', Lugar: '', isAvailable: false });
  const [selectedObject, setSelectedObject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [qrCodeId, setQrCodeId] = useState('');

  useEffect(() => {
    // Fetch all objects when the component mounts
    const fetchObjects = async () => {
      try {
        const objs = await getAllObjects(token);
        setObjects(objs);
      } catch (error) {
        console.error('Error al obtener objetos', error);
      }
    };

    fetchObjects();
  }, [token]);

  const handleAddObject = async () => {
    try {
      const response = await addObject(newObject, token);
      setNewObject({ NOMBRE: '', Lugar: '', isAvailable: false });
      setIsModalOpen(false);
      setQrCodeId(response.obj._id); // Set the QR code ID
      setIsQrModalOpen(true); // Open the QR modal
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        // Refresh the objects list after adding a new object
        const objs = await getAllObjects(token);
        setObjects(objs);
      }
    } catch (error) {
      console.error('Error al agregar objeto', error);
    }
  };

  const handleUpdateObject = async () => {
    if (selectedObject) {
      try {
        await updateObject(selectedObject, token);
        setSelectedObject(null);
        if (searchQuery) {
          handleSearch(searchQuery);
        } else {
          // Refresh the objects list after updating an object
          const objs = await getAllObjects(token);
          setObjects(objs);
        }
      } catch (error) {
        console.error('Error al actualizar objeto', error);
      }
    }
  };

  const handleDeleteObject = async (objectName) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este objeto?');
    if (confirmed) {
      try {
        await deleteObject(objectName, token);
        if (searchQuery) {
          handleSearch(searchQuery);
        } else {
          // Refresh the objects list after deleting an object
          const objs = await getAllObjects(token);
          setObjects(objs);
        }
      } catch (error) {
        console.error('Error al eliminar objeto', error);
      }
    }
  };

  const handleReadObject = async (objectName) => {
    try {
      const obj = await readObject(objectName, token);
      setSelectedObject(obj);
    } catch (error) {
      console.error('Error al leer objeto', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setCurrentPage(1);  // Reset to first page on new search
    if (query.trim() === '') {
      setObjects([]);
    } else {
      try {
        const objs = await getAllObjects(token);
        const lowerQuery = query.toLowerCase();
        const filteredObjects = objs.filter((obj) =>
          obj.NOMBRE && obj.NOMBRE.toLowerCase().includes(lowerQuery)
        );
        setObjects(filteredObjects);
      } catch (error) {
        console.error('Error al buscar objetos', error);
        setObjects([]);
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);  // Reset to first page on change
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

  // Logic for displaying current objects
  const indexOfLastObject = currentPage * resultsPerPage;
  const indexOfFirstObject = indexOfLastObject - resultsPerPage;
  const currentObjects = objects.slice(indexOfFirstObject, indexOfLastObject);
  const totalPages = Math.ceil(objects.length / resultsPerPage);

  return (
    <div className="container">
      <div className="search-bar">
        <h2>Buscar Objetos</h2>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => handleSearch(searchQuery)} className="crud-button">Buscar</button>
        <button onClick={() => setIsModalOpen(true)} className="crud-button">Agregar Objeto</button>
      </div>
      <table className="crud-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Lugar</th>
            <th>Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentObjects.length > 0 ? (
            currentObjects.map((obj) => (
              <tr key={obj.NOMBRE}>
                <td>{obj.NOMBRE}</td>
                <td>{obj.Lugar}</td>
                <td>{obj.isAvailable ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => handleReadObject(obj.NOMBRE)} className="crud-button">✏️</button>
                  <button onClick={() => handleDeleteObject(obj.NOMBRE)} className="crud-button">🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No se encontraron objetos.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Agregar Objeto"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Agregar Objeto</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre"
            value={newObject.NOMBRE}
            onChange={(e) => setNewObject({ ...newObject, NOMBRE: e.target.value })}
          />
          <input
            type="text"
            placeholder="Lugar"
            value={newObject.Lugar}
            onChange={(e) => setNewObject({ ...newObject, Lugar: e.target.value })}
          />
          <label>
            Disponible:
            <input
              type="checkbox"
              checked={newObject.isAvailable}
              onChange={(e) => setNewObject({ ...newObject, isAvailable: e.target.checked })}
            />
          </label>
          <button onClick={handleAddObject} className="crud-button">Agregar</button>
        </div>
      </Modal>
      {selectedObject && (
        <div className="edit-box">
          <h2>Editar Objeto</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre"
              value={selectedObject.NOMBRE}
              readOnly
            />
            <input
              type="text"
              placeholder="Lugar"
              value={selectedObject.Lugar}
              onChange={(e) => setSelectedObject({ ...selectedObject, Lugar: e.target.value })}
            />
            <label>
              Disponible:
              <input
                type="checkbox"
                checked={selectedObject.isAvailable}
                onChange={(e) => setSelectedObject({ ...selectedObject, isAvailable: e.target.checked })}
              />
            </label>
            <button onClick={handleUpdateObject} className="crud-button">Actualizar</button>
          </div>
        </div>
      )}
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
        <button onClick={downloadQRCode} className="crud-button">Descargar QR</button>
        <button onClick={() => window.print()} className="crud-button">Imprimir QR</button>
      </Modal>
    </div>
  );
};

export default ObjectsCrud;
