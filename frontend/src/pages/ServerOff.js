import React from 'react';
import '../styles/ErrorPage.css';

const ServerOff = () => (
  <div className="error-page server-off">
    <div className="error-icon">🔌</div>
    <h1>500</h1>
    <h2>Servidor Indisponível</h2>
    <p>O servidor está fora do ar ou não pôde ser alcançado.<br/>Tente novamente mais tarde.</p>
    <a href="/" className="error-btn">Voltar para o início</a>
  </div>
);

export default ServerOff;
