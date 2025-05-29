import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faTwitter, 
  faPinterest, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-bg">
      <div className="footer-wrapper wrapper">
        <div className="footer-container">
          <div className="footer-section about-section">
            <h3 className="h3-heading">Thread & Co.</h3>
            <p>
              Our furniture collection blends modern Scandinavian design with sculptural forms, 
              enhancing any space with comfort and style.
            </p>
            <div className="input-container">
              <input type="email" placeholder="Your email" />
              <button type="submit">Subscribe</button>
            </div>
            <ul className="social-icons">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faPinterest} />
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section links-section">
            <h6 className="h6-heading">Quick Links</h6>
            <ul className="footer-links">
              <li><Link to="/collection" className="footer-link">Collection</Link></li>
              <li><Link to="/furniture" className="footer-link">Furniture</Link></li>
              <li><Link to="/designers" className="footer-link">Designers</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section help-section">
            <h6 className="h6-heading">Help</h6>
            <ul className="footer-links">
              <li><Link to="/faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/shipping" className="footer-link">Shipping</Link></li>
              <li><Link to="/returns" className="footer-link">Returns</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-section">
            <h6 className="h6-heading">Contact</h6>
            <ul className="footer-links contact">
              <li className="footer-link">123 Main Street, City</li>
              <li className="footer-link">info@hihihi.com</li>
              <li className="footer-link">+1 (234) 567-8900</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="copyright">
        <div className="wrapper">
          <p>&copy; {new Date().getFullYear()} hihihi Furniture. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 