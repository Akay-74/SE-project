import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} Room Booking System. All rights reserved.</p>
                    <p className="footer-tagline">Built for the Indian hotel industry</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
