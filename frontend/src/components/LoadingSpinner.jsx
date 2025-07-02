import React from 'react';
import PropTypes from 'prop-types';
import '../styles/shared.css';

/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and overlay options
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  overlay = false, 
  message = '', 
  color = '#3498db' 
}) => {
  const spinnerClasses = `loading-spinner ${size}`;
  
  const spinnerStyle = {
    borderTopColor: color
  };

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={spinnerClasses} style={spinnerStyle}></div>
          {message && <p>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-center justify-center flex-column gap-2">
      <div className={spinnerClasses} style={spinnerStyle}></div>
      {message && <p className="text-center">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  overlay: PropTypes.bool,
  message: PropTypes.string,
  color: PropTypes.string
};

export default LoadingSpinner;
