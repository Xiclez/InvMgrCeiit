import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo1 from '../assets/logo.png';
import logo2 from '../assets/logoInvMgr.png';

const API_URL = 'http://ulsaceiit.xyz/users';

const Login = ({ setToken, setUsername }) => {
  const [username, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/iniciar_sesion`, {
        usrn: username,
        password: password,
      });

      console.log('Server response:', response.data);

      if (!response.data || !response.data.jwt) {
        throw new Error('Invalid response from server');
      }

      const token = response.data.jwt;

      setToken(token);
      setUsername(username);

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      console.log('Stored token:', localStorage.getItem('token'));

      setError('');
      navigate('/'); // Redirigir a la pantalla principal después de iniciar sesión exitosamente
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo1} alt="Logo 1" className="logo" />
        <img src={logo2} alt="Logo 2" className="logo" />
      </div>
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username or email"
              value={username}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="signup-prompt">Don't have an account? <a href="#">Sign up</a></p>
      </div>
    </div>
  );
};

export default Login;
