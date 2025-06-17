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
            Founded in 2010, Thread & Co. is a luxury fashion design studio, creating elegant, sophisticated and sustainable clothing collections. We offer minimalist yet inspiring designs that combine modern beauty and high functionality, allowing the wearer to express their personal style naturally and confidently every day.
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
              Thread & Co. was founded by a group of passionate fashion designers with a vision to combine Scandinavian minimalism with modern sophistication and ease. From our first ideas in a small atelier, we have grown into a globally recognized fashion brand.
            </p>
            <p>
              With a commitment to quality craftsmanship, sustainable details and timeless design, Thread & Co. creates clothes that not only look great but truly elevate the everyday experience of the wearer.
            </p>
            <p>
              Today, our collections can be found in the wardrobes of customers all over the world, from urban streets to modern offices and creative spaces, reflecting our lean yet inspiring design philosophy in every stitch.
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
                We believe that fashion should be a harmonious combination of aesthetics and practicality. Each design of Thread & Co. is not only visually appealing but also brings comfort, flexibility and modern lifestyle, beautiful to look at, confident to wear.
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
                Each of our fashion products is meticulously crafted down to the last stitch, combining traditional tailoring techniques with modern technology. The precision in every detail reflects our commitment to quality and lasting sophistication.
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
        <h2 className="h2-heading" style={{ textAlign: "center", width: "100%", display: "block" }}>
  Meet Our Team
</h2>

        <p className="text-center team-intro">
          Our team of designers, skilled tailors and creative professionals share a passion for high-quality fashion and an exceptional customer experience.
        </p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-1.jpg" alt="Team member" />
            </div>
            <h3>Vương Đức Hải</h3>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-2.jpg" alt="Team member" />
            </div>
            <h3>Lê Văn Hùng</h3>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-3.jpg" alt="Team member" />
            </div>
            <h3>Lưu Minh Đức</h3>
          </div>
          
          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-1.jpg" alt="Team member" />
            </div>
            <h3>Vũ Hoàng Nam</h3>
          </div>

          <div className="team-member">
            <div className="member-image">
              <img src="/images/team-2.jpg" alt="Team member" />
            </div>
            <h3>Vũ Đức Quang</h3>
          </div>

        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="wrapper">
          <h2>Ready to refresh your style?</h2>
          <p>
            Explore our exquisite handcrafted fashion collection or contact our design team to create unique outfits that suit your personality and needs.
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