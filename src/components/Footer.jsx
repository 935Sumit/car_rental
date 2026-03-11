import { Link } from 'react-router-dom'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Vintage Rides Hub</h3>
            <p>Your premier destination for premium car rentals in Anand, Gujarat. Experience luxury and comfort on every ride.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook" className="social-icon"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram" className="social-icon"><FaInstagram /></a>
              <a href="#" aria-label="Twitter" className="social-icon"><FaTwitter /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/saved">Saved Cars</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Rental Types</h4>
            <ul>
              <li><Link to="/">Hatchback</Link></li>
              <li><Link to="/">Sedan</Link></li>
              <li><Link to="/">SUV</Link></li>
              <li><Link to="/">Luxury</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="contact-info">
              <li><HiMail /> support@vintagerides.in</li>
              <li><HiPhone /> +91 98765 43210</li>
              <li><HiLocationMarker /> Anand, Gujarat - 388001</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Vintage Rides Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
