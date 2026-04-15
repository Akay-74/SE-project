import { Link } from 'react-router-dom';
import { FaHotel, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="logo">
                            <span>Kamra.com</span>
                        </Link>
                        <p>
                            India's trusted hotel booking platform. Find and book hotels
                            across 50+ cities with real-time availability and instant confirmation.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/search">Search Hotels</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Popular Cities</h4>
                        <ul className="footer-links">
                            <li><Link to="/search?city=Mumbai">Mumbai</Link></li>
                            <li><Link to="/search?city=Delhi">Delhi</Link></li>
                            <li><Link to="/search?city=Bangalore">Bangalore</Link></li>
                            <li><Link to="/search?city=Goa">Goa</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 Kamra.com. Built for the Indian hotel industry.</span>
                    <span>Made with ❤️ in India</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
