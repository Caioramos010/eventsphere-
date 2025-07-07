import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, EventCard, PageTitle, StandardButton, StandardCard } from '../components';
import { IoCalendarOutline, IoSearch, IoGridOutline, IoListOutline, IoAddCircleOutline } from 'react-icons/io5';
import '../styles/AllEvents.css';
import EventService from '../services/EventService';
import { useDialog } from '../contexts/DialogContext';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [filter, setFilter] = useState('all'); 
  const navigate = useNavigate();
  const dialog = useDialog();

  
  const filterEvents = useCallback(() => {
    let filtered = events;

    
    if (filter === 'my-events') {
      filtered = filtered.filter(event => event.source === 'created');
    } else if (filter === 'participating') {
      filtered = filtered.filter(event => event.source === 'participating');
    }

    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.localization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchTerm]);

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      
      
      
      const allMyEventsResult = await EventService.getAllMyEvents();
      
      if (allMyEventsResult.success) {
        const events = allMyEventsResult.events.map(event => ({
          ...event,
          
          userStatus: event.isOwner ? 'owner' : 'participant',
          source: event.isOwner ? 'created' : 'participating'
        }));
        
        setEvents(events);
      } else {
        console.error('Error loading all my events:', allMyEventsResult.message);
        setError(allMyEventsResult.message || 'Erro ao carregar eventos');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (eventId, success, message) => {
    if (success) {
      
      await loadAllEvents();
    } else {
      await dialog.alert(message || 'Erro ao participar do evento');
    }
  };

  const getStatusText = (event) => {
    if (event.state === 'ACTIVE') return 'Ativo';
    if (event.state === 'FINISHED') return 'Encerrado';
    if (event.state === 'CANCELED') return 'Cancelado';
    return 'Criado';
  };

  const getEventIcon = (event) => {
    if (event.userStatus === 'owner') return '👑';
    if (event.userStatus === 'collaborator') return '🤝';
    return '👤';
  };
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <PageTitle
              icon={IoCalendarOutline}
              title="Meus Eventos"
              subtitle="Eventos criados por você e onde você participa"
            />
            
            <StandardButton
              variant="primary"
              size="large"
              icon={IoAddCircleOutline}
              onClick={() => navigate('/create-event')}
            >
              Criar Evento
            </StandardButton>
          </div>
          <StandardCard variant="glass" padding="medium" className="events-controls">
            <div className="search-container">
              <IoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="view-controls">
              <StandardButton
                variant={viewMode === 'grid' ? 'info' : 'secondary'}
                size="small"
                icon={IoGridOutline}
                onClick={() => setViewMode('grid')}
              />
              <StandardButton
                variant={viewMode === 'list' ? 'info' : 'secondary'}
                size="small"
                icon={IoListOutline}
                onClick={() => setViewMode('list')}              />
            </div>
          </StandardCard>


          <div className="events-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando eventos...</p>
              </div>
            ) : error ? (              <div className="error-container">
                <div className="error-message">{error}</div>
                <StandardButton variant="primary" onClick={loadAllEvents}>
                  Tentar novamente
                </StandardButton>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-container">
                <IoCalendarOutline className="empty-icon" />
                <h3>
                  {searchTerm ? 'Nenhum evento encontrado' : 
                   filter === 'my-events' ? 'Você ainda não criou eventos' :
                   filter === 'participating' ? 'Você ainda não participa de eventos' :
                   'Você ainda não tem eventos'}
                </h3>
                <p>
                  {searchTerm ? 'Tente buscar por outros termos' :
                   filter === 'my-events' ? 'Crie seu primeiro evento!' :
                   filter === 'participating' ? 'Participe de eventos públicos ou aceite convites' :
                   'Crie eventos ou participe de eventos existentes'}
                </p>
                {!searchTerm && (
                  <button 
                    className="modern-btn"
                    onClick={() => navigate('/create-event')}
                  >
                    <IoAddCircleOutline />
                    <span>Criar Primeiro Evento</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={`events-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredEvents.map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-meta">
                      <span className="event-role">
                        {getEventIcon(event)} {event.source === 'created' ? 'Organizador' : 'Participante'}
                      </span>
                      <span className={`event-status status-${event.state?.toLowerCase()}`}>
                        {getStatusText(event)}
                      </span>
                    </div>
                    <EventCard
                      event={event}
                      type="primary"
                      linkTo={`/event/${event.id}`}
                      onParticipate={event.userStatus === 'visitor' ? handleParticipate : null}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllEvents;
