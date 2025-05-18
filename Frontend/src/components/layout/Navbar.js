import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faShoppingBag, 
  faBars, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItems } = useContext(CartContext);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.navlist') && !e.target.closest('#menu')) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <nav className="navbar flex between wrapper">
        <Link to="/" className="logo">hihihi</Link>

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
          <li>
            <Link to="/search" className="icon">
              <FontAwesomeIcon icon={faSearch} />
            </Link>
          </li>
          <li>
            <Link to="/login" className="icon">
              <FontAwesomeIcon icon={faUser} />
            </Link>
          </li>
          <li className="nav-item cart-icon-container">
            <Link to="/cart" className="icon">
              <FontAwesomeIcon icon={faShoppingBag} />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
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