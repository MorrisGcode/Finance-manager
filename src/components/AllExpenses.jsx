import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AllExpenses.css';

const AllExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="all-expenses-container">
      <header className="all-expenses-header">
        <h1>All Expenses</h1>
      </header>

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : (
        <>
          <div className="expenses-grid">
            {expenses.length === 0 ? (
              <p className="no-expenses">No expenses recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="expense-card">
                  <div className="expense-header">
                    <h3>{expense.description}</h3>
                    <span className="amount">Ksh{Number(expense.amount).toFixed(2)}</span>
                  </div>
                  <div className="expense-body">
                    <p className="category">{expense.category}</p>
                    <p className="date">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
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