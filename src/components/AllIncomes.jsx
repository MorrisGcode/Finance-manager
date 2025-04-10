import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/AllIncomes.css';

const AllIncomes = ({ user }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'income'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const incomesData = [];
      querySnapshot.forEach((doc) => {
        incomesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setIncomes(incomesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="all-incomes-container">
      <header className="all-incomes-header">
        <h1>All Incomes</h1>
      </header>

      {loading ? (
        <div className="loading">Loading incomes...</div>
      ) : (
        <>
          <div className="table-container">
            {incomes.length === 0 ? (
              <p className="no-incomes">No incomes recorded yet.</p>
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
                    <tr key={income.id}>
                      <td>{new Date(income.date).toLocaleDateString()}</td>
                      <td>{income.description}</td>
                      <td>{income.category}</td>
                      <td className="amount">Ksh{Number(income.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            Back to Dashboard
          </button>
        </>
      )}
    </div>
  );
};

export default AllIncomes;