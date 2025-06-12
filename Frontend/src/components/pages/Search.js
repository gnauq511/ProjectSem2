import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import '../../styles/Search.css';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract search query from URL parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
      searchProducts(query);
    }
  }, [location.search]);

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Update URL with search query
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      searchProducts(searchTerm);
    }
  };

  // Function to fetch products based on search term
  const searchProducts = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/products/search?keyword=${encodeURIComponent(query.trim())}`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = async (productId) => {
    try {
      // Assuming customer ID 1 for simplicity - in a real app, you'd get this from auth context
      const customerId = 1;
      await api.post(`/cart/${customerId}/add`, { productId, quantity: 1 });
      // Show success message or update cart count
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  return (
    <div className="search-page">
      <div className="main-search-container">
        <form onSubmit={handleSubmit} className="main-search-form">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="main-search-input"
            autoFocus
          />
          <button type="submit" className="main-search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Searching products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="search-results">
          <h2>Search Results {products.length > 0 && `(${products.length})`}</h2>
          
          {products.length === 0 ? (
            searchTerm ? (
              <div className="no-results">No products found for "{searchTerm}"</div>
            ) : (
              <div className="search-prompt">Enter a search term to find products</div>
            )
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} 
                      alt={product.name} 
                      className="product-image"
                      onClick={() => navigate(`/product/${product.id}`)}
                    />  
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                    </button>
                  </div>
                  <div className="product-info">
                    <h3 
                      className="product-name"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
