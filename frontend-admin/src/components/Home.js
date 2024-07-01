import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ username, onLogout }) => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Dashboard</h1>
        <div>
          Hola {username}! <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <div className="home-content">
        <h2>Gestión de</h2>
        <ul className="home-links">
          <li><Link to="/objects" className="home-link">Objetos</Link></li>
          <li><Link to="/loans" className="home-link">Préstamos</Link></li>
          <li><Link to="/users" className="home-link">Usuarios</Link></li>

        </ul>
      </div>
    </div>
  );
};

export default Home;
