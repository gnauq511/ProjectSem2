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
          Our fashion collections combine Scandinavian minimalism with modern, artful silhouettes, bringing elegance and comfort to every lifestyle.
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
              <li className="footer-link">13, Trinh Van Bo, Nam Tu Liem, Ha Noi</li>
              <li className="footer-link">threadandco@gmail.com</li>
              <li className="footer-link">+84 966 666 666</li>
            </ul>
            <div className="map-container" style={{ marginTop: "1rem", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12124.648362859425!2d105.74575744621828!3d21.033214514009835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455305afd834b%3A0x17268e09af37081e!2sT%C3%B2a%20nh%C3%A0%20FPT%20Polytechnic.!5e0!3m2!1svi!2s!4v1750226505766!5m2!1svi!2s" 
                width="100%" 
                height="180px" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright">
        <div className="wrapper">
          <p>&copy; {new Date().getFullYear()} Thread & Co. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 