import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../../App';
import '../../styles/Home.css';

// Import sample product data - in a real app would come from API
import data from '../../data/products.json';

const Home = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'seating', active: false },
    { id: 2, name: 'lighting', active: false },
    { id: 3, name: 'table', active: false },
    { id: 4, name: 'accessories', active: false }
  ]);
  
  // Simulate fetching products
  useEffect(() => {
    // In a real app, this would be an API call
    setProducts(data.products);
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
            <span>inova</span>tion
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
            {categories.map(category => (
              <div 
                key={category.id} 
                className={`category-card ${category.active ? 'active' : ''}`}
                onClick={() => filterByCategory(category.id)}
              >
                <div className="flex between">
                  <h5 className="h5-heading">{category.name}</h5>
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
            Our <span>bed</span> collection blends modern Scandinavian design with sculptural forms, enhancing
            any space with <span>Comfort</span> and <span>Style</span>.
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
            {filteredProducts.slice(0, 8).map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={`/${product.image}`} alt={product.name} />
                  <button 
                    className="btn brown-bg"
                    onClick={() => handleAddToCart(product)}
                  >
                    add to cart
                  </button>
                </div>

                <div className="product-info">
                  <small>{product.category}</small>
                  <h6 className="h6-heading">{product.name}</h6>
                  <p className="price">₫{parseInt(product.price.replace(/\D/g, '')).toLocaleString()}</p>
                </div>
              </div>
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