import React from 'react';
import { IoLogoInstagram, IoLogoLinkedin } from 'react-icons/io5';
import '../styles/Footer.css';
import { Link } from './Link';
import logoFooter from '../images/logo-footer.png';

const Footer = () => (
  <footer className="main-footer">
    <div className="main-footer-left">
      <span className="main-footer-menu"><Link to="/main" className='footer-link'>INICIO</Link><Link to="/eventos" className='footer-link'>EVENTOS</Link></span>
    </div>
    <div className="main-footer-center">
      <img src={logoFooter} alt="EventSphere" className="main-footer-logo" />
    </div>    <div className="main-footer-right">
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="main-footer-social">
        <IoLogoInstagram />
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="main-footer-social">
        <IoLogoLinkedin />
      </a>
    </div>
  </footer>
);

export default Footer;
