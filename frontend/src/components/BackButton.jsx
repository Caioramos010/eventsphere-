import React from 'react';
import { IoArrowBack } from 'react-icons/io5';
import '../styles/BackButton.css';

const BackButton = ({ 
  onClick, 
  className = '', 
  'aria-label': ariaLabel = 'Voltar',
  icon: Icon = IoArrowBack 
}) => {
  return (
    <button 
      className={`back-btn ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon />
    </button>
  );
};

export default BackButton;
