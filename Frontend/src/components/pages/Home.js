import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../../App';
import ProductItem from '../common/ProductItem';
import api from '../../services/api';
import '../../styles/Home.css';



const Home = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => { 
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        const categoriesData = categoriesResponse.data;
        setCategories(categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name.toLowerCase(),
          active: false
        })));
        
        // Fetch products
        const productsResponse = await api.get('/products');
        const productsData = productsResponse.data;
        setProducts(productsData);
        
        setLoading(false);
      } catch(err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
        
        
      }
    };
    fetchData();
  }, []);
  
  // Filter products by category
  const filterByCategory = (categoryId) => {
    setCategories(prev => 
      prev.map(cat => ({
        ...cat,
        active: cat.id === categoryId ? !cat.active : false
      }))
    );
  };
  
  // Get filtered products
  const getFilteredProducts = () => {
    const activeCategory = categories.find(cat => cat.active);
    if (!activeCategory) return products;
    
    return products.filter(product => 
      product.category.toLowerCase() === activeCategory.name.toLowerCase()
    );
  };
  
  const filteredProducts = getFilteredProducts();
  
  // Handle adding to cart with animation
  const handleAddToCart = (product) => {
    addToCart(product);
    
    // Could add animation logic here
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section wrapper flex">
        <div className="hero-content">
          <h1 className="h1-heading">
            <span>Fash</span>ion
          </h1>

          <p className="big-para">
            design your space
          </p>
          <Link to="/collection" className="btn golden-bg">Shop Now</Link>

          <div className="hero-image mt">
            <img src="/images/main.png" alt="Modern furniture" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="wrapper p-b">
          <div className="flex gap between">
            <h3 className="h3-heading">love where you live</h3>
            <Link to="/collection" className="btn golden-bg">view all collection</Link>
          </div>

          <div className="categories flex gap mt">
            {categories.slice(0, 4).map(cat => (
              <div 
                key={cat.id} 
                className={`category-card ${cat.active ? 'active' : ''}`}
                onClick={() => filterByCategory(cat.id)}
              >
                <div className="flex between">
                  <h5 className="h5-heading">{cat.name}</h5>
                  <div className="simple-icon brown-bg">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section>
        <div className="wrapper p-b">
          <h2 className="h2-heading gradient-txt">
          "At <span>Thread & Co.</span>, we believe fashion is self-expression. Every piece is <span>Handpicked</span>
          to help you stand out, <span>Feel confident</span>, and stay true to who you are — wherever <span>Life</span> takes you."
          </h2>

          <div className="bed-image mt">
            <img src="/images/bed.png" alt="Modern bed design" />

            <div className="bed-detail">
              <h6 className="h6-heading">Premium Oak Bed</h6>
              <p className="small-para">
                Handcrafted from sustainable oak with a minimalist Scandinavian design.
              </p>

              <div className="flex between">
                <p className="price">
                  <del>$2000</del>&nbsp;&nbsp;
                  $1500
                </p>
                <button 
                  className="simple-icon brown-bg"
                  onClick={() => handleAddToCart({
                    id: 'featured-bed',
                    name: 'Premium Oak Bed',
                    price: '1500',
                    image: '/images/bed.png', 
                    category: 'furniture'
                  })}
                >
                  <FontAwesomeIcon icon={faShoppingBag} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section>
        <div className="wrapper p-b">
          <h2 className="h2-heading brown-txt">New Arrivals</h2>
          <p className="avg-para">
            Discover our latest furniture pieces
          </p>

          <div className="products-grid mt">
            {filteredProducts.slice(0, 5).map(product => (
              <ProductItem 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>

          {filteredProducts.length > 8 && (
            <div className="center-btn mt">
              <Link to="/collection" className="btn brown-bg">View All Products</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 