import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/AllIncomes.css';

const AllIncomes = ({ user }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [totalFilteredIncomes, setTotalFilteredIncomes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'income'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
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

  useEffect(() => {
    if (!user) return;

    //income categories
    const defaultCategories = ['Salary', 'Business', 'Investments', 'Freelance', 'Other'];

    const q = query(
      collection(db, 'incomeCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customCategories = snapshot.docs.map(doc => doc.data().name);
      //default and custom categories
      const allCategories = [...new Set(['All Categories', ...defaultCategories, ...customCategories])];
      setCategories(allCategories);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredIncomes = incomes.filter(income => {
    const matchesDate = !dateFilter || income.date === dateFilter;
    const matchesCategory = !categoryFilter || categoryFilter === 'All Categories' || 
      income.category === categoryFilter;
    return matchesDate && matchesCategory;
  });

  useEffect(() => {
    const total = filteredIncomes.reduce((sum, income) => 
      sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount), 0);
    setTotalFilteredIncomes(total);
  }, [filteredIncomes]);

  return (
    <div className="all-incomes-container">
      <header className="incomes-header">
        <div className="header-content">
          <h2>Income History</h2>
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
          <div className="total-incomes">
            Total: Ksh {totalFilteredIncomes.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
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
          {filteredIncomes.length === 0 ? (
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
                {filteredIncomes.map((income) => (
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