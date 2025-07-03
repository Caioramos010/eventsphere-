import React, { useEffect, useState } from 'react';
import '../styles/Main.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '../components/Link';
import { PageTitle, StandardButton, StandardCard } from '../components';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import EventCard from '../components/EventCard';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdPublic, MdLock } from 'react-icons/md';
import { IoGridOutline } from 'react-icons/io5';

function Main() {  
  const [myEvents, setMyEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    
    loadEvents();
  }, [navigate]);  const loadEvents = async () => {
    try {
      setLoading(true);
      const [myEventsResult, publicEventsResult] = await Promise.all([
        EventService.getMyEvents(),
        EventService.getPublicEvents()
      ]);

      if (myEventsResult.success) {
        const validMyEvents = myEventsResult.events
          .filter(event => {
            if (!event.id) {
              return false;
            }
            return true;
          });
        
        setMyEvents(validMyEvents);
      }

      if (publicEventsResult.success) {
        const validPublicEvents = publicEventsResult.events
          .filter(event => {
            if (!event.id) {
              return false;
            }
            return true;
          });
        
        setPublicEvents(validPublicEvents);
      }
    } catch (error) {
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          <div className="page-header">
            <PageTitle
              icon={IoGridOutline}
              title="Painel Principal"
              subtitle="Gerencie seus eventos"
              description="Visualize, crie e participe de eventos"
              size="medium"
            />
          </div>
          <StandardCard variant="glass" padding="large" className="main-top-card">
            <div className="main-top-section">
              <Calendar events={myEvents} />
              
              <div className="actions-section">
                <h3 className="actions-title">Ações Rápidas</h3>                
                <Link to="/event/enter">
                  <StandardButton
                    variant="secondary"
                    size="large"
                    icon={FaCalendarAlt}
                    className="action-btn main-action-btn"
                  >
                    PARTICIPAR DE UM EVENTO
                  </StandardButton>
                </Link>
                
                <Link to="/create-event">
                  <StandardButton
                    variant="primary"
                    size="large"
                    icon={FaCalendarAlt}
                    className="action-btn main-action-btn"
                  >
                    CRIAR EVENTO
                  </StandardButton>
                </Link>
              </div>
            </div>
          </StandardCard>
          <section className="events-section">
            <StandardCard variant="glass" padding="large">
              <div className="section-header">
                <div className="section-title">
                  <MdLock className="section-icon" />
                  <span>MEUS EVENTOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>
                ) : myEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento encontrado</div>
                ) : (
                  myEvents.map(ev => (
                    <EventCard 
                      key={ev.id} 
                      event={ev}
                      type="primary" 
                      linkTo={`/event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </StandardCard>
          </section>
          <section className="events-section">
            <StandardCard variant="glass" padding="large">
              <div className="section-header">
                <div className="section-title">
                  <MdPublic className="section-icon" />
                  <span>EVENTOS PÚBLICOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>
                ) : publicEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento público encontrado</div>
                ) : (
                  publicEvents.map(ev => (
                    <EventCard
                      key={ev.id} 
                      event={ev} 
                      type="secondary" 
                      linkTo={`/event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </StandardCard>
          </section>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Main;