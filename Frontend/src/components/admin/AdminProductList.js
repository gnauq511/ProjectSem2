import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import AdminProductForm from './AdminProductForm';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch categories first
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
        
        // Then fetch products
        const productsResponse = await api.get('/products');
        
        // Map products with category names
        const productsWithCategories = productsResponse.data.map(product => {
          const category = categoriesResponse.data.find(cat => cat.id === product.categoryId);
          return {
            ...product,
            categoryName: category ? category.name : 'N/A'
          };
        });
        
        setProducts(productsWithCategories);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // No dependencies needed as this should only run once on mount
  }, []);
  
  // Function to refresh data when needed (after delete, etc.)
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and products
      const categoriesResponse = await api.get('/categories');
      const productsResponse = await api.get('/products');
      
      setCategories(categoriesResponse.data);
      
      // Map products with category names
      const productsWithCategories = productsResponse.data.map(product => {
        const category = categoriesResponse.data.find(cat => cat.id === product.categoryId);
        return {
          ...product,
          categoryName: category ? category.name : 'N/A'
        };
      });
      
      setProducts(productsWithCategories);
      setError(null);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/products/${productToDelete.id}`);
      // Refresh data after successful deletion
      await refreshData();
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again later.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    // Find the category for the updated product
    const category = categories.find(cat => cat.id === updatedProduct.categoryId);
    
    // Add the category name to the updated product
    const productWithCategory = {
      ...updatedProduct,
      categoryName: category ? category.name : 'N/A'
    };
    
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? productWithCategory : p
    ));
    setEditingProduct(null);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  if (editingProduct) {
    return (
      <AdminProductForm 
        product={editingProduct} 
        onCancel={handleCancelEdit}
        onProductUpdated={handleProductUpdated}
      />
    );
  }

  return (
    <div className="admin-product-list">
      <h2>Manage Products</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-actions">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>
                    ID
                    {sortField === 'id' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown} 
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th onClick={() => handleSort('name')}>
                    Name
                    {sortField === 'name' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown} 
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th onClick={() => handleSort('price')}>
                    Price
                    {sortField === 'price' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown} 
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th onClick={() => handleSort('stockQuantity')}>
                    Stock
                    {sortField === 'stockQuantity' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown} 
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>${parseFloat(product.price).toFixed(2)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.categoryName || 'N/A'}</td>
                      <td>
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="product-thumbnail" 
                          />
                        )}
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(product)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete the product "{productToDelete?.name}"?</p>
                <p>This action cannot be undone.</p>
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
        </>
      )}
    </div>
  );
};

export default AdminProductList;
