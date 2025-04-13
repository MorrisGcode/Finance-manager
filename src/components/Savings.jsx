import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import '../css/Savings.css';

function Savings({ user }) {
  const [savings, setSavings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'savings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavings(savingsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const targetNum = Number(targetAmount);
      const initialAmount = Number(amount);
      
      if (isNaN(targetNum) || isNaN(initialAmount)) {
        setError('Please enter valid amounts');
        return;
      }

      if (targetNum <= 0) {
        setError('Target amount must be greater than 0');
        return;
      }

      const progress = Math.min((initialAmount / targetNum) * 100, 100);

      // First create the saving goal
      const savingRef = await addDoc(collection(db, 'savings'), {
        title: title.trim(),
        description: description.trim(),
        targetAmount: targetNum,
        currentAmount: initialAmount,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        progress: Number(progress.toFixed(2))
      });

      // If there's an initial amount, create an expense record
      if (initialAmount > 0) {
        const expenseData = {
          amount: initialAmount,
          category: 'Savings',
          description: `Initial contribution to savings goal: ${title.trim()}`,
          userId: user.uid,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          savingId: savingRef.id,
          savingTitle: title.trim(),
          type: 'expense' // Add this field
        };

        await addDoc(collection(db, 'expenses'), expenseData);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add saving goal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setAmount('');
    setError('');
  };

  const handleAddAmount = async (savingId, currentAmount, targetAmount) => {
    const amount = prompt('Enter amount to add:');
    if (!amount) return;

    const newAmount = Number(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const savingDoc = savings.find(s => s.id === savingId);
      
      // First add the amount as an expense
      const expenseData = {
        amount: newAmount,
        category: 'Savings',
        description: `Contribution to savings goal: ${savingDoc.title}`,
        userId: user.uid,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: 'expense',
        savingId: savingId,
        savingTitle: savingDoc.title
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      // Then update the savings amount
      const updatedAmount = currentAmount + newAmount;
      await updateDoc(doc(db, 'savings', savingId), {
        currentAmount: updatedAmount,
        progress: (updatedAmount / Number(targetAmount)) * 100,
        updatedAt: new Date().toISOString()
      });

      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update amount');
    }
  };

  return (
    <div className="savings-container">
      <div className="savings-header">
        <h2>Savings Goals</h2>
        <button 
          className="new-saving-btn"
          onClick={() => setShowModal(true)}
        >
          New Saving Plan
        </button>
      </div>

      <div className="table-container">
        <table className="savings-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Target Amount</th>
              <th>Current Amount</th>
              <th>Progress</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {savings.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-savings">
                  No saving goals yet
                </td>
              </tr>
            ) : (
              savings.map(saving => (
                <tr key={saving.id}>
                  <td>{saving.title}</td>
                  <td>Ksh {saving.targetAmount.toLocaleString()}</td>
                  <td>Ksh {saving.currentAmount.toLocaleString()}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${saving.progress}%` }}
                      />
                      <span>{saving.progress.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>{new Date(saving.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleAddAmount(saving.id, saving.currentAmount, saving.targetAmount)}
                      className="add-amount-btn"
                    >
                      Add Amount
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>New Saving Plan</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="savings-form">
              <div className="form-group">
                <label htmlFor="title">Saving Title:</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Emergency Fund"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your saving goal..."
                  required
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetAmount">Target Amount (Ksh):</label>
                <input
                  type="number"
                  id="targetAmount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Initial Amount (Ksh):</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>

              <div className="modal-buttons">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Saving Goal'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Savings;