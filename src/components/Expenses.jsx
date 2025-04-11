import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/Expenses.css';
import CategoryManager from './CategoryManager';

const EXPENSE_CATEGORIES = [
  'Utilities',
  'Health',
  'Transportation',
  'Entertainment',
  'Debt Repayment'
];

const Expenses = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),  
      limit(5)  
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const expense = {
          id: doc.id,
          ...doc.data()
        };
        expensesData.push(expense);
        total += Number(expense.amount) || 0;
      });

      setExpenses(expensesData);
      setTotalExpenses(total);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenseCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => doc.data().name);
      setCustomCategories(categoriesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'expenses'), {
        amount: Number(amount),
        category,
        description,
        date,
        userId: user.uid,
        timestamp: serverTimestamp(), // Add server timestamp
        createdAt: new Date().toISOString()
      });

      // Clear form
      setAmount('');
      setDescription('');
      setDate('');
      setCategory('');
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expenses-container">
      <header className="expenses-header">
        <h2>Add New Expense</h2>
      </header>

      <div className="summary-section">
        <div className="total-expenses-card">
          <h3>Total Expenses</h3>
          <p className="total-amount">Ksh{totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Category:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {EXPENSE_CATEGORIES.concat(customCategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount (Ksh):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter expense description"
          />
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="back-btn"> Back to Dashboard</button>
        </div>
      </form>

      <div className="recent-expenses">
        <h3>Recent Expenses</h3>
        {expenses.length === 0 ? (
          <p className="no-expenses">No expenses recorded yet.</p>
        ) : (
          <div className="expenses-list">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-details">
                  <h4>{expense.description}</h4>
                  <p>{expense.category}</p>
                  <p className="expense-date">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="expense-amount">Ksh{Number(expense.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;