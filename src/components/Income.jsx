import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '/config/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import '../css/Income.css';
import IncomeCategoryManager from './IncomeCategoryManager';

const INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Investments',
  'Freelance',
  'Other'
];

function Income({ user }) {
  const [incomeList, setIncomeList] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'incomeCategories'),
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
      const incomeData = {
        amount: Number(amount),
        category,
        description,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString()
      };

      await addDoc(collection(db, 'income'), incomeData);

      // Clear form
      setAmount('');
      setDescription('');
      setCategory('Salary');
      setLoading(false);
    } catch (error) {
      console.error('Error adding income:', error);
      setLoading(false);
    }
  };

  return (
    <div className="income-container">
      <h2>Income Tracker</h2>
      <form onSubmit={handleSubmit} className="income-form">
        <div className="form-group">
          <label>Category:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {INCOME_CATEGORIES.concat(customCategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <IncomeCategoryManager user={user} />
        </div>

        <div className="form-group">
          <label>Amount (Ksh):</label>
          <input
            type="number"
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
            placeholder="Enter description"
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Income'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}

export default Income;
