import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import '../css/IncomeCategoryManager.css';

const IncomeCategoryManager = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'incomeCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await addDoc(collection(db, 'incomeCategories'), {
        name: newCategory.trim(),
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setNewCategory('');
    } catch (error) {
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'incomeCategories', categoryId));
    } catch (error) {
      setError('Failed to delete income category');
    }
  };

  return (
    <div className="category-manager income-category-manager">
      <h3>Manage Income Categories</h3>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleAddCategory} className="add-category-form">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New income category"
          className="category-input"
        />
        <button type="submit" className="add-category-btn">Add</button>
      </form>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-item">
            <span>{category.name}</span>
            <button 
              onClick={() => handleDeleteCategory(category.id)}
              className="delete-category-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeCategoryManager;