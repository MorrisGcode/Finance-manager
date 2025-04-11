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

  const handleEditCategory = (categoryId) => {
    // Placeholder for edit functionality
    console.log(`Edit category with ID: ${categoryId}`);
  };

  return (
    <div className="category-manager income-category-manager">
      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="category-row">
                <td>{category.name}</td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button 
                    onClick={() => handleEditCategory(category.id)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-category-section">
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleAddCategory} className="add-category-form">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New income category"
            className="category-input"
          />
          <button type="submit" className="add-category-btn">Add Category</button>
        </form>
      </div>
    </div>
  );
};

export default IncomeCategoryManager;