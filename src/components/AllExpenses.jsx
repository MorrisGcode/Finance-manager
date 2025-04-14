import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/AllExpenses.css';

// default categories 
const defaultExpenseCategories = [
  'Food',
  'Transport',
  'Entertainment',
  'Bills',
  'Shopping',
  'Healthcare',
  'Education',
  'Savings'
];

const AllExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenseCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customCategories = snapshot.docs.map(doc => doc.data().name);
      // Combine default and custom categories, remove duplicates
      const allCategories = [...new Set(['All Categories', ...defaultExpenseCategories, ...customCategories])];
      setCategories(allCategories);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesDate = !dateFilter || expense.date === dateFilter;
    const matchesCategory = !categoryFilter || categoryFilter === 'All Categories' || 
      expense.category === categoryFilter;
    return matchesDate && matchesCategory;
  });

  const totalFilteredExpenses = filteredExpenses.reduce((total, expense) => 
    total + expense.amount, 0);

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="all-expenses-container">
      <header className="expenses-header">
        <div className="header-content">
          <h2>All Expenses</h2>
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="dateFilter">Filter by Date:</label>
              <input
                type="date"
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="date-filter"
              />
              <button 
                onClick={() => setDateFilter('')}
                className="clear-filter-btn"
              >
                Clear Date
              </button>
            </div>
            <div className="filter-group">
              <label htmlFor="categoryFilter">Filter by Category:</label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="category-filter"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="total-expenses" style={{ color: "#f44336"}}>
            Total: Ksh {totalFilteredExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
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
          {filteredExpenses.length === 0 ? (
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
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td data-label="Date">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td data-label="Description">
                      {expense.description}
                    </td>
                    <td data-label="Category">
                      {expense.category}
                    </td>
                    <td data-label="Amount" className="expense-amount-cell">
                      Ksh {Number(expense.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td data-label="Type">
                      {expense.category === 'Savings' ? 'Savings' : 'Regular Expense'}
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

export default AllExpenses;

