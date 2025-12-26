import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Vintage Riders Hub</h3>
            <p>Your premier destination for classic and vintage automobiles. Buy, sell, or rent the car of your dreams.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook" className="social-icon facebook">f</a>
              <a href="#" aria-label="Instagram" className="social-icon instagram">in</a>
              <a href="#" aria-label="Twitter" className="social-icon twitter">t</a>
              <a href="#" aria-label="YouTube" className="social-icon youtube">yt</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/buy">Buy Cars</Link></li>
              <li><Link to="/sell">Sell Cars</Link></li>
              <li><Link to="/rent">Rentals</Link></li>
              <li><Link to="/price-predictor">Price Predictor</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/rent">Car Rentals</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#">Vehicle Appraisal</a></li>
              <li><a href="#">Financing Options</a></li>
              <li><a href="#">Insurance</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Help Center</Link></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Returns & Refunds</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="contact-info">
              <li><span className="icon-email"></span> info@vintageridershub.com</li>
              <li><span className="icon-phone"></span> +1 (555) 123-4567</li>
              <li><span className="icon-location"></span> 123 Classic Car Avenue, Los Angeles, CA 90001</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Vintage Riders Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

