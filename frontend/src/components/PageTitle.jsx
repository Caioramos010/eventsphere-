import React from 'react';
import '../styles/PageTitle.css';

const PageTitle = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  description,
  className = '',
  size = 'large' 
}) => {
  return (
    <div className={`page-title ${size} ${className}`}>
      <div className="page-title-content">
        <div className="page-title-icon">
          {Icon && <Icon />}
        </div>
        <div className="page-title-text">
          <h1 className="page-title-main">{title}</h1>
          {subtitle && <span className="page-title-subtitle">{subtitle}</span>}
          {description && <p className="page-title-description">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageTitle;
