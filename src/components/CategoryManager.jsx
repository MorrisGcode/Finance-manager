import React, { useState, useEffect } from 'react';
import { db } from '/config/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import '../css/CategoryManager.css';

const CategoryManager = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'expenseCategories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched categories:', categoriesData); // Debug log
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    setError('');

    try {
      const newCategoryData = {
        name: newCategory.trim(),
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      console.log('Adding category:', newCategoryData); // Debug log
      await addDoc(collection(db, 'expenseCategories'), newCategoryData);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error); // Debug log
      setError('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!editingName.trim()) return;
    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'expenseCategories', categoryId), {
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

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    setError('');

    try {
      await deleteDoc(doc(db, 'expenseCategories', categoryId));
    } catch (error) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  return (
    <div className="category-manager">
      <h3>Manage Categories</h3>
      {error && <p className="error-message">{error}</p>}
      
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-categories">No custom categories yet</td>
              </tr>
            ) : (
              categories.map(category => (
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
                          onClick={() => handleUpdateCategory(category.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="add-category-section">
        <form onSubmit={handleAddCategory} className="add-category-form">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="category-input"
            disabled={loading}
          />
          <button type="submit" className="add-category-btn" disabled={loading || !newCategory.trim()}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryManager;