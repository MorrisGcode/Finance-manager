import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/AllExpenses.css';

const AllExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc') 
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expensesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          expensesData.push({
            id: doc.id,
            ...data,
            // date format
            date: data.date || data.timestamp?.toDate().toISOString().split('T')[0]
          });
        });
        setExpenses(expensesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching expenses:", error);
        setError("Failed to load expenses");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up expenses listener:", err);
      setError("Failed to load expenses");
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="all-expenses-container">
      <header className="all-expenses-header">
        <h1>All Expenses</h1>
      </header>

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-container">
            {expenses.length === 0 ? (
              <p className="no-expenses">No expenses recorded yet.</p>
            ) : (
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.description}</td>
                      <td>{expense.category}</td>
                      <td className="amount">Ksh{Number(expense.amount).toFixed(2)}</td>
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

export default AllExpenses;

