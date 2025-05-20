import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import ProductItem from '../common/ProductItem';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faSort } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Collection.css';

const Collection = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
        
        // Fetch products
        const productsResponse = await api.get('/products');
        setProducts(productsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter products by category
  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  // Sort products
  const handleSort = (option) => {
    setSortOption(option);
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Apply category filter
    if (activeCategory) {
      filtered = filtered.filter(product => 
        product.category && 
        (typeof product.category === 'object' 
          ? product.category.id === activeCategory
          : product.category === activeCategory)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep default order
        break;
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Handle adding to cart
  const handleAddToCart = (product) => {
    addToCart(product);
    // Could add a toast notification here
  };

  return (
    <div className="collection-page">
      <div className="collection-header wrapper">
        <h1 className="h1-heading">Our Collection</h1>
        <p className="avg-para">Discover our carefully curated furniture collection</p>
      </div>

      <div className="collection-filters wrapper">
        <div className="filter-controls">
          <button 
            className="filter-toggle btn outline-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={showFilters ? faTimes : faFilter} />
            {showFilters ? ' Hide Filters' : ' Show Filters'}
          </button>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sort-dropdown">
            <label>
              <FontAwesomeIcon icon={faSort} /> Sort by:
              <select value={sortOption} onChange={(e) => handleSort(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </label>
          </div>
        </div>
        
        {showFilters && (
          <div className="category-filters">
            <h4>Categories</h4>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="collection-content wrapper">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <>
            <div className="products-count">
              Showing {filteredProducts.length} products
              {activeCategory && (
                <button 
                  className="clear-filters"
                  onClick={() => setActiveCategory(null)}
                >
                  Clear filters
                </button>
              )}
            </div>
            
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductItem 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                  />
                ))
              ) : (
                <div className="no-products">
                  <p>No products found matching your criteria.</p>
                  <button 
                    className="btn brown-bg"
                    onClick={() => {
                      setActiveCategory(null);
                      setSearchTerm('');
                      setSortOption('default');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
