import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/home.css';
import CalendarAnimation from '../components/Animation';
import { StandardButton } from '../components';
import { IoCalendarOutline, IoStatsChartOutline, IoPersonAddOutline, IoLogInOutline, IoPersonOutline } from 'react-icons/io5';
import logo from '../images/logo.png';
import logoFooter from '../images/logo-footer.png';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const headerRef = useRef(null);
  
  useEffect(() => {
    const body = document.body;
    body.classList.add('page-fade-in');
    const timeout = setTimeout(() => {
      body.classList.remove('page-fade-in');
    }, 350);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 50) {
          headerRef.current.classList.add('header-scrolled');
        } else {
          headerRef.current.classList.remove('header-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="home-container">
      <header className="home-header" ref={headerRef}>
        <div className="header-content">
          <img src={logo} alt="EventSphere" className="header-logo" />
          <div className="header-actions">
            <StandardButton
              variant="outline"
              size="medium"
              icon={IoLogInOutline}
              onClick={() => navigate('/login')}
              className="header-btn"
            >
              LOGIN
            </StandardButton>
            <StandardButton
              variant="primary"
              size="medium"
              icon={IoPersonOutline}
              onClick={() => navigate('/register')}
              className="header-btn"
            >
              REGISTRO
            </StandardButton>
          </div>
        </div>
      </header>
      
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Transforme Seus Eventos em Experiências Memoráveis</h1>
          <p className="hero-subtitle">
            Organize, gerencie e conecte pessoas com facilidade. 
            Seu evento, do planejamento ao sucesso, com uma plataforma completa e intuitiva.
          </p>
          <StandardButton
            variant="primary"
            size="large"
            icon={IoCalendarOutline}
            onClick={() => navigate('/register')}
            className="hero-cta-btn"
          >
            CRIAR MEU EVENTO AGORA
          </StandardButton>
        </div>
        <div className="scroll-indicator" onClick={scrollToFeatures}>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      <section className="features-section" ref={featuresRef}>
        <h2 className="section-title-home">Tudo o que você precisa para eventos incríveis</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <IoCalendarOutline />
            </div>
            <h3 className="feature-title">Planejamento Simplificado</h3>
            <p className="feature-desc">
              Crie e configure eventos em minutos com nossa interface intuitiva.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <IoPersonAddOutline />
            </div>
            <h3 className="feature-title">Gestão de Participantes</h3>
            <p className="feature-desc">
              Envie convites, confirme presenças e gerencie check-ins com facilidade.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <IoStatsChartOutline />
            </div>
            <h3 className="feature-title">Relatórios Detalhados</h3>
            <p className="feature-desc">
              Acompanhe métricas para entender o impacto e sucesso dos seus eventos.
            </p>
          </div>
        </div>
      </section>

      <section className="animation-section">
        <div className="animation-container">
          <CalendarAnimation />
        </div>
        <div className="animation-content">
          <h2 className="animation-title">Evento Criado em Um Clique</h2>
          <p className="animation-desc">
            Crie, personalize e visualize eventos com facilidade em nossa 
            interface moderna e intuitiva. Economize tempo com nossas ferramentas avançadas.
          </p>
          <StandardButton
            variant="primary"
            size="large"
            icon={IoPersonAddOutline}
            onClick={() => navigate('/register')}
            className="animation-cta-btn"
          >
            COMECE AGORA
          </StandardButton>
        </div>
      </section>

      <footer className="home-footer">
        <img src={logoFooter} alt="EventSphere" className="footer-logo" />
        <p className="footer-copyright">
          © {new Date().getFullYear()} EventSphere. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Home;
