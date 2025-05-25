import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSave, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

// Mock data for categories in case the API fails
const MOCK_CATEGORIES = [
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Quần' },
  { id: 3, name: 'Giày' },
  { id: 4, name: 'Phụ kiện' }
];

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // For adding new category
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [isAdding, setIsAdding] = useState(false);
  
  // For editing category
  const [editingCategory, setEditingCategory] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '' });
  
  // For delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API
      try {
        const response = await api.get('/categories');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          setUsingMockData(false);
          return;
        }
      } catch (apiError) {
        console.error('API Error fetching categories:', apiError);
        // Fall through to use mock data
      }
      
      // If API fails, use mock data
      console.log('Using mock category data as fallback');
      setCategories(MOCK_CATEGORIES);
      setUsingMockData(true);
    } catch (err) {
      console.error('Error in fetchCategories:', err);
      setError('Failed to load categories. Using default categories.');
      setCategories(MOCK_CATEGORIES);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    // If using mock data, just add to the local state
    if (usingMockData) {
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      const newCategoryWithId = {
        id: newId,
        name: newCategory.name.trim()
      };
      
      setCategories([...categories, newCategoryWithId]);
      setNewCategory({ name: '' });
      setIsAdding(false);
      setSuccess('Category added successfully (in mock mode)!');
      setTimeout(() => setSuccess(null), 3000);
      return;
    }
    
    // Otherwise try the API
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we're only sending the name property
      const categoryData = { name: newCategory.name.trim() };
      
      const response = await api.post('/categories', categoryData);
      
      if (response.status === 201 || response.status === 200) {
        // Refresh the categories list to ensure we have the latest data
        await fetchCategories();
        setNewCategory({ name: '' });
        setIsAdding(false);
        setSuccess('Category added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (err) {
      console.error('Error adding category:', err);
      let errorMessage = 'Failed to add category. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category.id);
    setEditFormData({ name: category.name });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    // If using mock data, just update the local state
    if (usingMockData) {
      setCategories(categories.map(category => 
        category.id === editingCategory ? { ...category, name: editFormData.name.trim() } : category
      ));
      
      setEditingCategory(null);
      setSuccess('Category updated successfully (in mock mode)!');
      setTimeout(() => setSuccess(null), 3000);
      return;
    }
    
    // Otherwise try the API
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/categories/${editingCategory}`, editFormData);
      
      if (response.status === 200) {
        setCategories(categories.map(category => 
          category.id === editingCategory ? response.data : category
        ));
        
        setEditingCategory(null);
        setSuccess('Category updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(
        err.response?.data || 
        'Failed to update category. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    // If using mock data, just update the local state
    if (usingMockData) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setSuccess('Category deleted successfully (in mock mode)!');
      setTimeout(() => setSuccess(null), 3000);
      return;
    }
    
    // Otherwise try the API
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(`/categories/${categoryToDelete.id}`);
      
      if (response.status === 200) {
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setSuccess('Category deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      let errorMessage = 'Failed to delete category.';
      
      if (err.response?.status === 500) {
        errorMessage = 'This category may be in use by products and cannot be deleted.';
      } else if (err.response?.data) {
        errorMessage = err.response.data;
      }
      
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setError(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewCategory({ name: '' });
    setError(null);
  };

  return (
    <div className="admin-category-list">
      <div className="category-header">
        <h2>Manage Categories</h2>
        {!isAdding && (
          <button 
            className="add-category-btn"
            onClick={() => setIsAdding(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Category
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {usingMockData && (
        <div className="warning-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>Using mock data. Changes will not be saved to the database.</span>
        </div>
      )}
      
      {isAdding && (
        <div className="category-form">
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label htmlFor="name">Category Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={handleAddInputChange}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancelAdd}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} /> {loading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && !categories.length ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="category-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>
                      {editingCategory === category.id ? (
                        <form onSubmit={handleEditSubmit} className="inline-edit-form">
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditInputChange}
                            required
                          />
                          <div className="inline-form-actions">
                            <button type="submit" className="save-btn-sm">
                              <FontAwesomeIcon icon={faSave} />
                            </button>
                            <button 
                              type="button" 
                              className="cancel-btn-sm"
                              onClick={handleCancelEdit}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="action-buttons">
                      {editingCategory !== category.id && (
                        <>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick(category)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-results">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the category "{categoryToDelete?.name}"?</p>
            <p className="warning-text">Warning: This will affect all products in this category.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryList;
