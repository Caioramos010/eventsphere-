import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../images/logo.png';
import userIcon from '../images/user.png';
import { Link } from './Link';
import AuthService from '../services/AuthService';
import getUserPhotoUrl from '../utils/getUserPhotoUrl';
import { useUser } from '../contexts/UserContext';

const Header = () => {  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const currentUser = AuthService.getCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);
  
  const handleLogout = () => {
    AuthService.logout();
    clearUser();
    navigate('/login');
  };
  
  const toggleDropdown = (e) => {
    e.stopPropagation(); 
    
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        right: window.innerWidth - rect.right
      });
    }
    
    setDropdownOpen(!dropdownOpen);
  };
    
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);


  const userPhoto = getUserPhotoUrl(user?.photo || currentUser?.photo) || userIcon;

  return (
    <header className="main-header">
      <img src={logo} alt="EventSphere" className="main-header-logo" />      <nav className="main-header-nav">
        <Link to="/main" className="main-header-link">INÍCIO</Link>
        <Link to="/eventos" className="main-header-link">EVENTOS</Link>        {currentUser ? (
          <div className="main-header-user">
            <div className="profile-icon-container" ref={dropdownRef}>              <img 
                ref={iconRef}
                src={userPhoto} 
                alt="User Profile" 
                className={`main-header-user-icon ${dropdownOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div 
                  className="user-dropdown"                  style={{ 
                    top: `${dropdownPosition.top}px`, 
                    right: `${dropdownPosition.right}px` 
                  }}
                >
                  <Link to="/profile" className="dropdown-item">PERFIL</Link>
                  <button onClick={handleLogout} className="dropdown-item">SAIR</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login" className="main-header-link main-header-user">
            <img src={userIcon} alt="User Profile" className="main-header-user-icon" />
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
