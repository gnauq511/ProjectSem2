import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const AdminProductForm = ({ product, onCancel, onProductUpdated, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: { squantity: 0, mquantity: 0, lquantity: 0, xlQuantity: 0, xxlQuantity: 0 },
    categoryId: '',
    image: '',
    imageView2: '',
    imageView3: '',
    imageView4: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
    
    // If editing an existing product, populate the form
    if (product) {
      const existingStock = product.stockQuantity && typeof product.stockQuantity === 'object' 
        ? product.stockQuantity 
        : {};

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stockQuantity: {
          squantity: existingStock.squantity ?? 0,
          mquantity: existingStock.mquantity ?? 0,
          lquantity: existingStock.lquantity ?? 0,
          xlQuantity: existingStock.xlQuantity ?? 0,
          xxlQuantity: existingStock.xxlQuantity ?? 0,
        },
        categoryId: product.categoryId || '',
        image: product.image || '',
        imageView2: product.imageView2 || '',
        imageView3: product.imageView3 || '',
        imageView4: product.imageView4 || ''
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      stockQuantity: {
        ...prevData.stockQuantity,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      return false;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    for (const key in formData.stockQuantity) {
      const value = formData.stockQuantity[key];
      if (value === '' || isNaN(value) || parseInt(value) < 0) {
        setError('Please enter a valid stock quantity (0 or more) for all sizes.');
        return false;
      }
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return false;
    }
    if (!formData.image) {
      setError('Main product image URL is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Format data for API
      const stockData = {};
      for (const [size, qty] of Object.entries(formData.stockQuantity)) {
        stockData[size] = parseInt(qty, 10) || 0;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: stockData
      };
      
      let response;
      
      if (product) {
        // Update existing product
        response = await api.put(`/products/${product.id}`, productData);
        setSuccess('Product updated successfully!');
        
        if (onProductUpdated) {
          onProductUpdated(response.data);
        }
      } else {
        // Create new product
        response = await api.post('/products', productData);
        setSuccess('Product created successfully!');
        
        // Reset form after successful creation
        setFormData({
          name: '',
          description: '',
          price: '',
          stockQuantity: { squantity: 0, mquantity: 0, lquantity: 0, xlQuantity: 0, xxlQuantity: 0 },
          categoryId: '',
          image: '',
          imageView2: '',
          imageView3: '',
          imageView4: ''
        });
        
        if (onProductAdded) {
          onProductAdded(response.data);
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-product-form">
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="form-group stock-inputs">
            <label>Stock Quantity *</label>
            <div className="size-inputs-container">
              <div className="size-input">
                <label htmlFor="squantity">Size S</label>
                <input type="number" id="squantity" name="squantity" value={formData.stockQuantity.squantity} onChange={handleStockChange} min="0" required />
              </div>
              <div className="size-input">
                <label htmlFor="mquantity">Size M</label>
                <input type="number" id="mquantity" name="mquantity" value={formData.stockQuantity.mquantity} onChange={handleStockChange} min="0" required />
              </div>
              <div className="size-input">
                <label htmlFor="lquantity">Size L</label>
                <input type="number" id="lquantity" name="lquantity" value={formData.stockQuantity.lquantity} onChange={handleStockChange} min="0" required />
              </div>
              <div className="size-input">
                <label htmlFor="xlQuantity">Size XL</label>
                <input type="number" id="xlQuantity" name="xlQuantity" value={formData.stockQuantity.xlQuantity} onChange={handleStockChange} min="0" required />
              </div>
              <div className="size-input">
                <label htmlFor="xxlQuantity">Size XXL</label>
                <input type="number" id="xxlQuantity" name="xxlQuantity" value={formData.stockQuantity.xxlQuantity} onChange={handleStockChange} min="0" required />
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter product description"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Main Image URL *</label>
          <div className="image-input-container">
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter image URL"
              required
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Product preview" />
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="imageView2">Additional Image URL 2</label>
            <input
              type="text"
              id="imageView2"
              name="imageView2"
              value={formData.imageView2}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imageView3">Additional Image URL 3</label>
            <input
              type="text"
              id="imageView3"
              name="imageView3"
              value={formData.imageView3}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imageView4">Additional Image URL 4</label>
            <input
              type="text"
              id="imageView4"
              name="imageView4"
              value={formData.imageView4}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
