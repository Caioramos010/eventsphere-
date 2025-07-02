import React from 'react';
import '../styles/ErrorPage.css';

const NotFound = () => (
  <div className="error-page not-found">
    <div className="error-icon">🔍</div>
    <h1>404</h1>
    <h2>Página não encontrada</h2>
    <p>A página que você procura não existe ou foi removida.</p>
    <a href="/" className="error-btn">Voltar para o início</a>
  </div>
);

export default NotFound;
