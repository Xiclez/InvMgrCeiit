import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  readUser
} from '../api/usersAPI';
import './Crud.css';

Modal.setAppElement('#root');

const UsersCrud = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', tuition: '', name: '', surName: '', role: 'Usuario' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  useEffect(() => {
    // Fetch all users when the component mounts
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers(token);
        setUsers(users);
      } catch (error) {
        console.error('Error al obtener usuarios', error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleAddUser = async () => {
    try {
      const response = await addUser(newUser, token);
      setNewUser({ username: '', password: '', tuition: '', name: '', surName: '', role: 'Usuario' });
      setIsModalOpen(false);
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        // Refresh the users list after adding a new user
        const users = await getAllUsers(token);
        setUsers(users);
      }
    } catch (error) {
      console.error('Error al agregar usuario', error);
    }
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        await updateUser(selectedUser, token);
        setSelectedUser(null);
        if (searchQuery) {
          handleSearch(searchQuery);
        } else {
          // Refresh the users list after updating a user
          const users = await getAllUsers(token);
          setUsers(users);
        }
      } catch (error) {
        console.error('Error al actualizar usuario', error);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmed) {
      try {
        await deleteUser(userId, token);
        if (searchQuery) {
          handleSearch(searchQuery);
        } else {
          // Refresh the users list after deleting a user
          const users = await getAllUsers(token);
          setUsers(users);
        }
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
    setCurrentPage(1);  // Reset to first page on new search
    if (query.trim() === '') {
      setUsers([]);
    } else {
      try {
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
      } catch (error) {
        console.error('Error al buscar usuarios', error);
        setUsers([]);
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

  // Logic for displaying current users
  const indexOfLastUser = currentPage * resultsPerPage;
  const indexOfFirstUser = indexOfLastUser - resultsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / resultsPerPage);

  return (
    <div className="container">
      <div className="search-bar">
        <h2>Buscar Usuarios</h2>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, matrícula o usuario"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => handleSearch(searchQuery)} className="crud-button">Buscar</button>
        <button onClick={() => setIsModalOpen(true)} className="crud-button">Agregar Usuario</button>
      </div>
      <table className="crud-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Matrícula</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.tuition}</td>
                <td>{user.name}</td>
                <td>{user.surName}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleReadUser(user._id)} className="crud-button">✏️</button>
                  <button onClick={() => handleDeleteUser(user._id)} className="crud-button">🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No se encontraron usuarios.</td>
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
        contentLabel="Agregar Usuario"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Agregar Usuario</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Usuario"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <input
            type="text"
            placeholder="Matrícula"
            value={newUser.tuition}
            onChange={(e) => setNewUser({ ...newUser, tuition: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nombre"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Apellido"
            value={newUser.surName}
            onChange={(e) => setNewUser({ ...newUser, surName: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="Administrador">Administrador</option>
            <option value="Desarrollador">Desarrollador</option>
            <option value="Usuario">Usuario</option>
          </select>
          <button onClick={handleAddUser} className="crud-button">Agregar</button>
        </div>
      </Modal>
      {selectedUser && (
        <div className="edit-box">
          <h2>Editar Usuario</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={selectedUser.username}
              onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={selectedUser.password}
              onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Matrícula"
              value={selectedUser.tuition}
              onChange={(e) => setSelectedUser({ ...selectedUser, tuition: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nombre"
              value={selectedUser.name}
              onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={selectedUser.surName}
              onChange={(e) => setSelectedUser({ ...selectedUser, surName: e.target.value })}
            />
            <select
              value={selectedUser.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
            >
              <option value="Administrador">Administrador</option>
              <option value="Desarrollador">Desarrollador</option>
              <option value="Usuario">Usuario</option>
            </select>
            <button onClick={handleUpdateUser} className="crud-button">Actualizar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCrud;
