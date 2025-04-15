import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import '../css/IncomeCategoryManager.css';

const IncomeCategoryManager = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleEditCategory = async (categoryId) => {
    if (!editingName.trim()) return;
    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'incomeCategories', categoryId), {
        name: editingName.trim(),
        updatedAt: new Date().toISOString()
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  return (
    <div className="category-manager income-category-manager">
    <h3>Manage Income Categories</h3>
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
                <td>
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="edit-input"
                      disabled={loading}
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                <td className="action-buttons">
                  {editingId === category.id ? (
                    <>
                      <button 
                        onClick={() => handleEditCategory(category.id)}
                        className="save-btn"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="cancel-btn"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEditing(category)}
                        className="edit-btn"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="delete-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </>
                  )}
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