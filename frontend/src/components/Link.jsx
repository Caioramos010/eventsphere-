import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export function Link({ to, className = '', children, ...props }) {
  const navigate = useNavigate();
  function handleClick(e) {
    e.preventDefault();
    document.body.classList.add('page-fade-out');
    setTimeout(() => {
      document.body.classList.remove('page-fade-out');
      navigate(to);
    }, 250);
  }
  return (
    <RouterLink to={to} className={className} onClick={handleClick} {...props}>
      {children}
    </RouterLink>
  );
}

export default Link;
