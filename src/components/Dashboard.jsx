import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import Expenses from './Expenses';

const Dashboard = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    //income total
    const incomeQuery = query(
      collection(db, 'income'),
      where('userId', '==', user.uid)
    );

    const unsubscribeIncome = onSnapshot(incomeQuery, (querySnapshot) => {
      let total = 0;
      querySnapshot.forEach((doc) => {
        const income = doc.data();
        total += Number(income.amount) || 0;
      });
      setTotalIncome(total);
    });

    
    return () => {
      unsubscribeIncome();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'), 
      limit(3) 
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (querySnapshot) => {
      const expensesData = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const expense = {
          id: doc.id,
          ...doc.data()
        };
        const amount = Number(expense.amount) || 0;
        expensesData.push({ ...expense, amount });
        total += amount;
      });

      setExpenses(expensesData);
      setTotalExpenses(total);
    });

    return () => {
      unsubscribeExpenses();
    };
  }, [user]);

  return (
    <div className="dashboard-layout">
      <div className="side-menu">
        <div className="menu-header">
          <h3>Menu</h3>
        </div>
        <nav className="menu-items">
          <button 
            onClick={() => navigate('/dashboard')}
            className="menu-item active"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/all-expenses')}
            className="menu-item"
          >
            All Expenses
          </button>
          <button 
            onClick={() => navigate('/all-incomes')}
            className="menu-item"
          >
            All Incomes
          </button>
        </nav>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome, {user?.displayName || user.email}!</h1>
        </header>

        <div className="dashboard-summary">
          <div className="summary-cards">
            <div className="summary-card income">
              <h3>Total Income</h3>
              <p className="total-amount">Ksh{totalIncome.toFixed(2)}</p>
              <button 
                onClick={() => navigate('/add-income')} 
                className="add-income-btn"
              >
                Add Income
              </button>
            </div>
            <div className="summary-card expenses">
              <h3>Total Expenses</h3>
              <p className="total-amount">Ksh{totalExpenses.toFixed(2)}</p>
              <div className="expense-buttons">
                <button 
                  onClick={() => navigate('/add-expense')} 
                  className="add-expense-btn"
                >
                  Add Expense
                </button>
              </div>
            </div>
            <div className="summary-card balance">
              <h3>Balance</h3>
              <p className="total-amount">Ksh{(totalIncome - totalExpenses).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          <h2>Recent Expenses</h2>
          <div className="expenses-list">
            {expenses.length === 0 ? (
              <p className="no-expenses">No expenses recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <h3>{expense.description}</h3>
                    <p className="expense-category">{expense.category}</p>
                    <p className="expense-date">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="expense-amount">Ksh{expense.amount.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;