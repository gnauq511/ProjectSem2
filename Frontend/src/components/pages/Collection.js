import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import ProductItem from '../common/ProductItem';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faSort, faSearch, faChevronLeft, faChevronRight, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Collection.css';

const Collection = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Filtering and Sorting State
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPriceSortDropdown, setShowPriceSortDropdown] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories (only once)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on filters, sorting, and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 20,
          categoryId: activeCategory,
        };

        // Map sortOption to API parameter
        if (sortOption === 'price-asc') {
            params.sort = 'price,asc';
        } else if (sortOption === 'price-desc') {
            params.sort = 'price,desc';
        } else if (sortOption === 'name-asc') {
            params.sort = 'name,asc';
        } else if (sortOption === 'name-desc') {
            params.sort = 'name,desc';
        } else {
            // 'default' or 'popular' or 'top-sales' - could be by product ID desc or a custom backend popular/sales sort
            // For now, default sort will be handled by the backend if no 'sort' param is provided
            // If 'top-sales' is selected, you might need a specific backend endpoint or logic
        }

        const response = await api.get('/products', { params });
        
        setProducts(response.data.content);
        setTotalPages(response.data.page.totalPages);
        setTotalProducts(response.data.page.totalElements);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
        setTotalPages(0);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, activeCategory, sortOption]);

  // New useEffect to read category from URL on component mount or URL change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryIdFromUrl = queryParams.get('category');
    if (categoryIdFromUrl) {
      setActiveCategory(parseInt(categoryIdFromUrl));
    } else {
      setActiveCategory(null); // Clear active category if no param in URL
    }
  }, [location.search]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [activeCategory, sortOption]);

  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleSort = (option) => {
    setSortOption(option);
    setShowPriceSortDropdown(false); // Close dropdown when a sort option is selected
  };

  const handlePriceSortToggle = () => {
    setShowPriceSortDropdown(prev => !prev);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // Trigger search by resetting page, which is a dependency of the fetch effect
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="collection-page">
      <div className="collection-header wrapper">
        <h1 className="h1-heading">Our Collection</h1>
        <p className="avg-para">Discover our carefully curated furniture collection</p>
      </div>

      <div className="collection-main-content wrapper flex">
        {/* Category Sidebar */}
        <div className="sidebar-category-filters">
          <div className="sidebar-header flex align-center">
            <FontAwesomeIcon icon={faFilter} />
            <h4 className="h4-heading">Category</h4>
          </div>
          <ul className="category-list">
            <li 
              className={`category-list-item ${activeCategory === null ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(null)}
            >
              All Products
            </li>
           
            {categories.map(category => (
              <li
                key={category.id}
                className={`category-list-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Products and Sorting Area */}
        <div className="products-content-area">
          <div className="sort-controls flex align-center">
            <div className="sort-options-group flex align-center gap-15">
              <span className="sort-label">Sort by:</span>
              <button
                className={`sort-btn ${sortOption === 'default' ? 'active' : ''}`}
                onClick={() => handleSort('default')}
              >
                Popular
              </button>
              <button
                className={`sort-btn ${sortOption === 'latest' ? 'active' : ''}`}
                onClick={() => handleSort('latest')}
              >
                Latest
              </button>
              <button
                className={`sort-btn ${sortOption === 'top-sales' ? 'active' : ''}`} // Placeholder for Top Sales
                onClick={() => handleSort('top-sales')} // This will currently use default backend sort
              >
                Top Sales
              </button>
              <div className="sort-price-dropdown-container">
                  <button 
                    className={`sort-btn price-btn ${sortOption.startsWith('price-') ? 'active' : ''}`}
                    onClick={handlePriceSortToggle}
                  >
                    Price <FontAwesomeIcon icon={faAngleDown} />
                  </button>
                  {showPriceSortDropdown && (
                      <div className="price-dropdown-content">
                          <button 
                              className={`dropdown-item ${sortOption === 'price-asc' ? 'active' : ''}`}
                              onClick={() => handleSort('price,asc')}
                          >
                              Price: Low to High
                          </button>
                          <button 
                              className={`dropdown-item ${sortOption === 'price-desc' ? 'active' : ''}`}
                              onClick={() => handleSort('price,desc')}
                          >
                              Price: High to Low
                          </button>
                      </div>
                  )}
              </div>
            </div>
            <div className="products-count">
              Showing {products.length} of {totalProducts} products
              {activeCategory && (
                <button 
                  className="clear-filters"
                  onClick={() => setActiveCategory(null)}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          {/* Main content area for products (grid and pagination) */}
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : (
            <> {/* This fragment correctly wraps the elements */}
              <div className="products-grid">
                {products.length > 0 ? (
                  products.map(product => (
                    <ProductItem 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))
                ) : (
                  <div className="no-products">
                    <p>No products found matching your criteria.</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 0}
                    className="pagination-btn arrow-btn"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  {
                    Array.from({ length: totalPages }, (_, i) => i).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPage(p)} 
                        className={`pagination-btn ${page === p ? 'active' : ''}`}
                      >
                        {p + 1}
                      </button>
                    ))
                  }
                  <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= totalPages - 1}
                    className="pagination-btn arrow-btn"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
