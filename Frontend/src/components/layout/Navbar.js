import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faShoppingBag, 
  faBars, 
  faTimes,
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';
import { logoutFromPayPal } from '../paypal/PayPalButton';
import '../../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems, currentUser, setCurrentUser, setCartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current page is search page
  const isSearchPage = location.pathname === '/search';
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.navlist') && !e.target.closest('#menu')) {
        setMenuOpen(false);
      }
      if (showUserMenu && !e.target.closest('.user-menu') && !e.target.closest('.user-icon')) {
        setShowUserMenu(false);
      }
      if (showSearchInput && !e.target.closest('.search-form') && !e.target.closest('.search-icon')) {
        setShowSearchInput(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, showUserMenu, showSearchInput]);

  // Total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    // Focus the search input when it appears
    if (!showSearchInput) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }, 10);
    }
  };
  

  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };
  
  // Handle cart icon click - only fetch cart items when needed
  const handleCartClick = () => {
    // If we have a fetchCartItems function in the context, call it
    if (currentUser?.customerId && window.fetchCartItems) {
      window.fetchCartItems();
    }
    navigate('/cart');
  };
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    
    // Log out from PayPal
    logoutFromPayPal();
    
    // Clear user data from context
    setCurrentUser(null);
    
    // Clear cart items
    setCartItems([]);
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="navbar flex between wrapper">
        <Link to="/" className="logo">Thread & Co.</Link>

        <ul className={`navlist ${menuOpen ? 'navlist-active' : ''}`} id="list">
          <li><Link to="/collection" className="link">Collection</Link></li>
          <li><Link to="/furniture" className="link">Furniture</Link></li>
          <li><Link to="/designers" className="link">Designers</Link></li>
          <li><Link to="/feedback" className="link">Feedback</Link></li>
          <li><Link to="/about" className="link">About Us</Link></li>
          <li><Link to="/contact" className="link">Contact Us</Link></li>

          <ul className="social-icons">
            <li><a href="https://facebook.com" className="icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={['fab', 'facebook-f']} />
            </a></li>
            <li><a href="https://twitter.com" className="icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={['fab', 'x-twitter']} />
            </a></li>
            <li><a href="https://pinterest.com" className="icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={['fab', 'pinterest']} />
            </a></li>
            <li><a href="https://instagram.com" className="icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={['fab', 'instagram']} />
            </a></li>
          </ul>
        </ul>

        <ul className="nav-icons flex">
          {!isSearchPage && (
            <li className="search-icon-container">
              <div className="icon search-icon" onClick={toggleSearchInput}>
                <FontAwesomeIcon icon={faSearch} />
              </div>
              {showSearchInput && (
                <div className="search-popup">
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <button type="submit" className="search-button">
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                    <button 
                      type="button" 
                      className="close-search-button"
                      onClick={toggleSearchInput}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </form>
                </div>
              )}
            </li>
          )}
          <li className="user-icon-container">
            <div className="icon user-icon" onClick={toggleUserMenu}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            {showUserMenu && (
              <div className="user-menu">
                {currentUser ? (
                  <>
                    <div className="user-menu-item user-info">
                      <span>Hi, {currentUser.username}</span>
                    </div>
                    <Link to="/profile" className="user-menu-item">
                      <FontAwesomeIcon icon={faUser} /> Profile
                    </Link>
                    <Link to="/orders" className="user-menu-item">
                      <FontAwesomeIcon icon={faShoppingBag} /> My Orders
                    </Link>
                    <div className="user-menu-item" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="user-menu-item">
                      Login
                    </Link>
                    <Link to="/register" className="user-menu-item">
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </li>
          <li className="nav-item cart-icon-container">
            <div onClick={handleCartClick} className="icon" style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faShoppingBag} />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </div>
          </li>

          <li>
            <button className="icon menu-toggle" id="menu" onClick={toggleMenu}>
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar; 