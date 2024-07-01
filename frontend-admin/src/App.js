import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ObjectsCrud from './components/ObjectsCrud';
import LoansCrud from './components/LoansCrud';
import UsersCrud from './components/UsersCrud';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (token) {
        try {
          // Aquí podrías hacer una solicitud para verificar si el token es válido
        } catch (error) {
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
        }
      }
    };

    checkTokenValidity();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  if (!token) {
    return <Login setToken={setToken} setUsername={setUsername} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home username={username} onLogout={handleLogout} />} />
        <Route path="/objects" element={<ObjectsCrud token={token} />} />
        <Route path="/loans" element={<LoansCrud token={token} />} />
        <Route path="/users" element={<UsersCrud token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;
