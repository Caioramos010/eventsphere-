import React from 'react';
import '../styles/StandardCard.css';

const StandardCard = ({
  children,
  variant = 'default', 
  padding = 'medium', 
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const cardClasses = [
    'standard-card',
    `standard-card-${variant}`,
    `standard-card-padding-${padding}`,
    hover ? 'standard-card-hover' : '',
    onClick ? 'standard-card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardElement>
  );
};

export default StandardCard;
