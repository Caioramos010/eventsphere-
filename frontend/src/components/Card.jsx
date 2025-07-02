import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Card.css';

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  shadow = true,
  hover = false,
  rounded = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'card';
  const variantClasses = {
    default: 'card-default',
    glass: 'card-glass',
    outlined: 'card-outlined',
    elevated: 'card-elevated'
  };
  
  const paddingClasses = {
    none: 'card-padding-none',
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadow && 'card-shadow',
    hover && 'card-hover',
    rounded && 'card-rounded',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'glass', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  shadow: PropTypes.bool,
  hover: PropTypes.bool,
  rounded: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

// Subcomponents
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
