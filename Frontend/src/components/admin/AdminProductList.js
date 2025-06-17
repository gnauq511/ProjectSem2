import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch, faSortUp, faSortDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import AdminProductForm from './AdminProductForm';
import '../../styles/AdminProductList.css';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      let currentCategories = categories;
      if (currentCategories.length === 0) {
        const categoriesResponse = await api.get('/categories');
        currentCategories = categoriesResponse.data;
        setCategories(currentCategories);
      }

      const params = {
        page: currentPage,
        size: pageSize,
        sort: `${sortField},${sortDirection}`,
        keyword: searchTerm || null,
      };

      const response = await api.get('/products', { params });
      const { content, totalPages: newTotalPages } = response.data;

      const productsWithCategories = content.map(product => {
        const category = currentCategories.find(cat => cat.id === product.categoryId);
        return {
          ...product,
          categoryName: category ? category.name : 'N/A',
        };
      });

      setProducts(productsWithCategories);
      setTotalPages(newTotalPages);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, categories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
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
      setShowDeleteModal(false);
      setProductToDelete(null);
      if (products.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again later.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleProductAdded = () => {
    setShowAddForm(false);
    fetchProducts();
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    fetchProducts();
  };

  if (showAddForm) {
    return (
      <AdminProductForm
        onCancel={() => setShowAddForm(false)}
        onProductAdded={handleProductAdded}
      />
    );
  }

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
            onChange={handleSearchChange}
          />
        </div>
        <button className="add-category-btn" onClick={() => setShowAddForm(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th rowSpan="2" onClick={() => handleSort('id')}>
                    ID
                    {sortField === 'id' && (
                      <FontAwesomeIcon
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown}
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th rowSpan="2" onClick={() => handleSort('name')}>
                    Name
                    {sortField === 'name' && (
                      <FontAwesomeIcon
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown}
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th rowSpan="2" onClick={() => handleSort('price')}>
                    Price
                    {sortField === 'price' && (
                      <FontAwesomeIcon
                        icon={sortDirection === 'asc' ? faSortUp : faSortDown}
                        className="sort-icon"
                      />
                    )}
                  </th>
                  <th colSpan="5" style={{ textAlign: 'center' }}>Stock quantity</th>
                  <th rowSpan="2">Category</th>
                  <th rowSpan="2">Image</th>
                  <th rowSpan="2">Actions</th>
                </tr>
                <tr>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                  <th>XL</th>
                  <th>XXL</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>${parseFloat(product.price).toFixed(2)}</td>
                      <td>{product.stockQuantity?.squantity ?? 'N/A'}</td>
                      <td>{product.stockQuantity?.mquantity ?? 'N/A'}</td>
                      <td>{product.stockQuantity?.lquantity ?? 'N/A'}</td>
                      <td>{product.stockQuantity?.xlQuantity ?? 'N/A'}</td>
                      <td>{product.stockQuantity?.xxlQuantity ?? 'N/A'}</td>
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
                    <td colSpan="11" className="no-results">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(page => page - 1)}
              disabled={currentPage === 0}
            >
              &lt;
            </button>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i).map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={currentPage === pageNumber ? 'active' : ''}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(page => page + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              &gt;
            </button>
          </div>

          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete the product "{productToDelete?.name}"?</p>
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
