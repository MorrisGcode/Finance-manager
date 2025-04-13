import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/AllIncomes.css';

const AllIncomes = ({ user }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'income'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const incomesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIncomes(incomesData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Failed to load incomes');
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="all-incomes-container">
      <header className="incomes-header">
        <div className="header-content">
          <h2>Income History</h2>
        </div>
        <button
          onClick={() => navigate("/add-income")}
          className="add-income-btn"
        >
          <span className="btn-icon">+</span>
          Add New Income
        </button>
      </header>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading incomes...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          {incomes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p className="empty-message">No incomes recorded yet.</p>
              <p className="empty-subtitle">Start by adding your first income</p>
            </div>
          ) : (
            <table className="incomes-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="income-row">
                    <td className="date-cell">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="description-cell">{income.description}</td>
                    <td className="category-cell">
                      <span className="category-tag">{income.category}</span>
                    </td>
                    <td className="income-amount-cell">
                      Ksh {Number(income.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AllIncomes;