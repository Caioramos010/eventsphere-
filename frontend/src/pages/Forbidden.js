import React from 'react';
import '../styles/ErrorPage.css';

const Forbidden = () => (
  <div className="error-page forbidden">
    <div className="error-icon">🚫</div>
    <h1>403</h1>
    <h2>Acesso Negado</h2>
    <p>Você não tem permissão para acessar esta página.</p>
    <a href="/" className="error-btn">Voltar para o início</a>
  </div>
);

export default Forbidden;
