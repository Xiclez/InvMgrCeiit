import React, { useState, useEffect } from 'react';
import { getAllLoans, addLoan, updateLoan, deleteLoan, readLoan } from '../api/LoansAPI';
import './Crud.css';

const LoansCrud = ({ token }) => {
  const [loans, setLoans] = useState([]);
  const [newLoan, setNewLoan] = useState({ borrower: '', item: '', dueDate: '' });
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const lns = await getAllLoans(token);
      setLoans(lns || []);
    } catch (error) {
      console.error('Error al cargar préstamos', error);
      setLoans([]);
    }
  };

  const handleAddLoan = async () => {
    try {
      await addLoan(newLoan, token);
      setNewLoan({ borrower: '', item: '', dueDate: '' });
      loadLoans();
    } catch (error) {
      console.error('Error al agregar préstamo', error);
    }
  };

  const handleUpdateLoan = async () => {
    if (selectedLoan) {
      try {
        await updateLoan(selectedLoan, token);
        setSelectedLoan(null);
        loadLoans();
      } catch (error) {
        console.error('Error al actualizar préstamo', error);
      }
    }
  };

  const handleDeleteLoan = async (loanId) => {
    try {
      await deleteLoan(loanId, token);
      loadLoans();
    } catch (error) {
      console.error('Error al eliminar préstamo', error);
    }
  };

  const handleReadLoan = async (loanId) => {
    try {
      const loan = await readLoan(loanId, token);
      setSelectedLoan(loan);
    } catch (error) {
      console.error('Error al leer préstamo', error);
    }
  };

  return (
    <div className="crud-container">
      <div className="crud-box">
        <h2>Agregar Préstamo</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Borrower"
            value={newLoan.borrower}
            onChange={(e) => setNewLoan({ ...newLoan, borrower: e.target.value })}
          />
          <input
            type="text"
            placeholder="Item"
            value={newLoan.item}
            onChange={(e) => setNewLoan({ ...newLoan, item: e.target.value })}
          />
          <input
            type="date"
            placeholder="Due Date"
            value={newLoan.dueDate}
            onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
          />
          <button onClick={handleAddLoan} className="crud-button">Agregar</button>
        </div>
      </div>
      <div className="crud-box">
        <h2>Préstamos</h2>
        <ul className="crud-list">
          {loans.map((loan) => (
            <li key={loan.id} className="crud-item">
              {loan.borrower} - {loan.item} - {loan.dueDate}
              <button onClick={() => handleReadLoan(loan.id)} className="crud-button">✏️</button>
              <button onClick={() => handleDeleteLoan(loan.id)} className="crud-button">🗑️</button>
            </li>
          ))}
        </ul>
      </div>
      {selectedLoan && (
        <div className="crud-box">
          <h2>Editar Préstamo</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Borrower"
              value={selectedLoan.borrower}
              readOnly
            />
            <input
              type="text"
              placeholder="Item"
              value={selectedLoan.item}
              onChange={(e) => setSelectedLoan({ ...selectedLoan, item: e.target.value })}
            />
            <input
              type="date"
              placeholder="Due Date"
              value={selectedLoan.dueDate}
              onChange={(e) => setSelectedLoan({ ...selectedLoan, dueDate: e.target.value })}
            />
            <button onClick={handleUpdateLoan} className="crud-button">Actualizar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansCrud;
