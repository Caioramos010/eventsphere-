import React from 'react';
import '../styles/StandardButton.css';

const StandardButton = ({
  children,
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left', 
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'standard-btn',
    `standard-btn-${variant}`,
    `standard-btn-${size}`,
    fullWidth ? 'standard-btn-full-width' : '',
    loading ? 'standard-btn-loading' : '',
    disabled ? 'standard-btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="standard-btn-spinner" />}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="standard-btn-icon standard-btn-icon-left" />
      )}
      
      <span className="standard-btn-text">{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="standard-btn-icon standard-btn-icon-right" />
      )}
    </button>
  );
};

export default StandardButton;
