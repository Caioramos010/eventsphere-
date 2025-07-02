import React from 'react';
import '../styles/ErrorPage.css';
import logo from '../images/logo.png';
import { IoBan, IoServer, IoSearch } from 'react-icons/io5';

export const Forbidden = () => (
    <div className='page-error'>
        <div className="error-page forbidden">
            <img src={logo} alt="EventSphere Logo" className="error-logo" />
            <div className="error-icon"><IoBan size={64} /></div>
            <h1>403</h1>
            <h2>Acesso Negado</h2>
            <p>Você não tem permissão para acessar esta página.</p>
            <a href="/" className="error-btn">Voltar para o início</a>
        </div>
    </div>

);

export const ServerOff = () => (
    <div className='page-error'>
        <div className="error-page server-off">
            <img src={logo} alt="EventSphere Logo" className="error-logo" />
            <div className="error-icon"><IoServer size={64} /></div>
            <h1>500</h1>
            <h2>Servidor Indisponível</h2>
            <p>O servidor está fora do ar ou não pôde ser alcançado.<br/>Tente novamente mais tarde.</p>
            <a href="/" className="error-btn">Voltar para o início</a>
        </div>
    </div>
);

export const NotFound = () => (
    <div className='page-error'>
        <div className="error-page not-found">
            <img src={logo} alt="EventSphere Logo" className="error-logo" />
            <div className="error-icon"><IoSearch size={64} /></div>
            <h1>404</h1>
            <h2>Página não encontrada</h2>
            <p>A página que você procura não existe ou foi removida.</p>
            <a href="/" className="error-btn">Voltar para o início</a>
        </div>
    </div>

);
