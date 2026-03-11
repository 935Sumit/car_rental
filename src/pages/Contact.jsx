import { motion } from 'framer-motion'
import { HiPhone, HiChatAlt2, HiMail, HiLocationMarker } from 'react-icons/hi'
import './Contact.css'

const Contact = () => {
  const faqs = [
    {
      q: "How do I book a rental car?",
      a: "Browse our collection, select your dates, and click 'Book Now'. You'll need to be logged in to complete the booking."
    },
    {
      q: "What documents are required?",
      a: "A valid driving license, Aadhaar card, and a security deposit are required at the time of pickup."
    },
    {
      q: "Are there any hidden charges?",
      a: "No, our pricing is transparent. The total price shown during booking is what you pay."
    },
    {
      q: "What is your fuel policy?",
      a: "We provide cars with a full tank, and we expect them to be returned with a full tank."
    },
    {
      q: "Can I cancel my booking?",
      a: "Yes, you can cancel up to 24 hours before your pickup time for a full refund."
    }
  ]

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Get in Touch
          </motion.h1>
          <p>We're here to help you get on the road</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          <motion.div
            className="contact-info-cards"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="contact-card">
              <div className="card-icon"><HiPhone /></div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
              <p>+91 91234 56789</p>
            </div>

            <div className="contact-card">
              <div className="card-icon"><HiChatAlt2 /></div>
              <h3>WhatsApp Support</h3>
              <p>+91 98765 43210</p>
              <span>Available 24/7 for support</span>
            </div>

            <div className="contact-card">
              <div className="card-icon"><HiMail /></div>
              <h3>Email</h3>
              <p>support@vintagerides.in</p>
              <p>info@vintagerides.in</p>
            </div>

            <div className="contact-card">
              <div className="card-icon"><HiLocationMarker /></div>
              <h3>Location</h3>
              <p>123, Heritage Square</p>
              <p>Anand, Gujarat - 388001</p>
            </div>
          </motion.div>

          <motion.div
            className="support-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="info-block">
              <h3>Business Hours</h3>
              <div className="hours-grid">
                <span>Monday - Friday:</span> <span>9:00 AM - 9:00 PM</span>
                <span>Saturday - Sunday:</span> <span>10:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="info-block">
              <h3>Rental Support Info</h3>
              <p>Our dedicated rental support team is available round the clock to assist you with active bookings, breakdown assistance, and any emergency queries.</p>
              <ul className="support-list">
                <li>24/7 Roadside Assistance</li>
                <li>Instant Booking Confirmations</li>
                <li>Doorstep Delivery Support</li>
                <li>Flexible Pickup Options</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
