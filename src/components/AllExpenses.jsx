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
        // where('type', '==', 'expense'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expensesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          expensesData.push({
            id: doc.id,
            ...data,
            date: data.date || new Date(data.createdAt).toISOString().split('T')[0],
            amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount
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

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="all-expenses-container">
      <header className="expenses-header">
        <div className="header-content">
          <h2>All Expenses</h2>
          <div className="total-expenses">
            Total: Ksh{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => navigate("/add-expense")}
          className="add-expense-btn"
        >
          Add New Expense
        </button>
      </header>

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
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
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td className="amount">Ksh{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{expense.category === 'Savings' ? 'Savings' : 'Regular Expense'}</td>
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

export default AllExpenses;

