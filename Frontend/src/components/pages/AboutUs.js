import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLeaf, 
  faHandshake, 
  faAward, 
  faCube
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content wrapper">
          <h1>About Our Story</h1>
          <p>
            Established in 2010, hihihi is a premium furniture design studio 
            dedicated to creating elegant, functional, and sustainable home decor.
          </p>
        </div>
      </div>
      
      {/* Our Story Section */}
      <section className="about-section wrapper">
        <div className="about-grid">
          <div className="about-image">
            <img src="/images/about-story.jpg" alt="Our furniture workshop" />
          </div>
          
          <div className="about-content">
            <h2 className="h2-heading brown-txt">Our Story</h2>
            <p>
              Founded by a team of passionate designers with a vision to blend 
              Scandinavian minimalism with modern functionality, hihihi has grown 
              into a recognized brand in the furniture industry.
            </p>
            <p>
              What started as a small workshop has evolved into a global design 
              studio with a commitment to quality craftsmanship, sustainable 
              practices, and timeless design that enhances everyday living.
            </p>
            <p>
              Today, our pieces can be found in homes, offices, and commercial 
              spaces around the world, bringing our design philosophy to diverse 
              environments and lifestyles.
            </p>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="values-section">
        <div className="wrapper">
          <h2 className="h2-heading text-center">Our Core Values</h2>
          
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faCube} />
              </div>
              <h3>Design Excellence</h3>
              <p>
                We believe in creating furniture that balances aesthetic beauty 
                with practical functionality, ensuring each piece is both a joy 
                to look at and a pleasure to use.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <h3>Sustainability</h3>
              <p>
                Environmental responsibility is central to our operations. 
                We use sustainably sourced materials and implement eco-friendly 
                manufacturing processes.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faAward} />
              </div>
              <h3>Quality Craftsmanship</h3>
              <p>
                Every piece is crafted with meticulous attention to detail, 
                using traditional woodworking techniques combined with 
                modern technology.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3>Customer Satisfaction</h3>
              <p>
                We're dedicated to providing exceptional service throughout 
                the customer journey, from initial consultation to after-sales 
                support.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="team-section wrapper">
        <h2 className="h2-heading text-center">Meet Our Team</h2>
        <p className="text-center team-intro">
          Our diverse team of designers, craftspeople, and specialists share a 
          passion for exceptional furniture and customer service.
        </p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-1.jpg" alt="Team member" />
            </div>
            <h3>Emma Johnson</h3>
            <p>Founder & Lead Designer</p>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-2.jpg" alt="Team member" />
            </div>
            <h3>David Chen</h3>
            <p>Creative Director</p>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-3.jpg" alt="Team member" />
            </div>
            <h3>Sophie Martins</h3>
            <p>Master Craftsperson</p>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-4.jpg" alt="Team member" />
            </div>
            <h3>Michael Brooks</h3>
            <p>Materials Specialist</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="wrapper">
          <h2>Ready to Transform Your Space?</h2>
          <p>
            Browse our collection of handcrafted furniture pieces or get in touch 
            with our design team for custom projects.
          </p>
          <div className="cta-buttons">
            <Link to="/collection" className="btn brown-bg">View Collection</Link>
            <Link to="/contact" className="btn golden-bg">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs; 