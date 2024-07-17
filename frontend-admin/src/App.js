import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Home from './components/Home';
import ObjectsCrud from './components/ObjectsCrud';
import LoansCrud from './components/LoansCrud';
import UsersCrud from './components/UsersCrud';
import LogsTable from './components/LogsTable';
import AddNewItem from './components/AddNewItem';
import AddNewLoan from './components/AddNewLoan';
import AddNewUser from './components/AddNewUser';
import ObjectLoanDetails from './components/ObjectLoanDetails';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (!token) {
    return <Login setToken={setToken} setUsername={setUsername} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout username={username} onLogout={handleLogout} />}>
        <Route index element={<Home />} />
        <Route path="objects" element={<ObjectsCrud token={token} data={data} setData={setData} />} />
        <Route path="loans" element={<LoansCrud token={token} />} />
        <Route path="users" element={<UsersCrud token={token} />} />
        <Route path="logs" element={<LogsTable token={token} />} />
        <Route path="add-new-item" element={<AddNewItem token={token} />} />
        <Route path="add-new-loan" element={<AddNewLoan token={token} />} />
        <Route path="add-new-user" element={<AddNewUser token={token} />} />
        <Route path="object-loan-details/:id" element={<ObjectLoanDetails token={token} />} />
      </Route>
    </Routes>
  );
}

export default App;
