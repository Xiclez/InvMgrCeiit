import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const objs = await getAllObjects(token);
      setObjects(objs || []);
    } catch (error) {
      console.error('Error al cargar objetos', error);
      setObjects([]);
    }
  };

  const handleAddObject = async () => {
    try {
      await addObject(newObject, token);
      setNewObject({ NOMBRE: '', Lugar: '', isAvailable: false });
      setIsModalOpen(false);
      loadObjects();
    } catch (error) {
      console.error('Error al agregar objeto', error);
    }
  };

  const handleUpdateObject = async () => {
    if (selectedObject) {
      try {
        await updateObject(selectedObject, token);
        setSelectedObject(null);
        loadObjects();
      } catch (error) {
        console.error('Error al actualizar objeto', error);
      }
    }
  };

  const handleDeleteObject = async (objectName) => {
    try {
      await deleteObject(objectName, token);
      loadObjects();
    } catch (error) {
      console.error('Error al eliminar objeto', error);
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

  const filteredObjects = objects.filter((obj) =>
    obj.NOMBRE && obj.NOMBRE.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-container">
      <div className="crud-box">
        <h2>Buscar Objetos</h2>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setIsModalOpen(true)} className="crud-button">Agregar Objeto</button>
      </div>
      <div className="crud-box">
        <h2>Objetos</h2>
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
            {filteredObjects.map((obj) => (
              <tr key={obj.NOMBRE}>
                <td>{obj.NOMBRE}</td>
                <td>{obj.Lugar}</td>
                <td>{obj.isAvailable ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => handleReadObject(obj.NOMBRE)} className="crud-button">✏️</button>
                  <button onClick={() => handleDeleteObject(obj.NOMBRE)} className="crud-button">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="crud-box">
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
    </div>
  );
};

export default ObjectsCrud;
