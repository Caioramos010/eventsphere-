import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../components/Link';
import '../styles/EventCard.css';
import { FaCalendarAlt, FaCrown, FaUserFriends, FaUserPlus } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import API_CONFIG from '../config/api';
import ParticipantService from '../services/ParticipantService';

const EventCard = ({ event, type, linkTo, onParticipate }) => {
  
  const handleParticipateClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (onParticipate) {
      try {
        const result = await ParticipantService.joinPublicEvent(event.id);
        if (result.success) {
          onParticipate(event.id, true);
        } else {
          console.error('Erro ao participar:', result.message);
          onParticipate(event.id, false, result.message);
        }
      } catch (error) {
        console.error('Erro ao participar:', error);
        onParticipate(event.id, false, 'Erro de conexão');
      }
    }
  };
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_DOWNLOAD}/${imagePath}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    let date;
    if (typeof dateString === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString + 'T12:00:00');
      } else if (dateString.includes('T') || !isNaN(Date.parse(dateString))) {
        date = new Date(dateString);
      } else {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          return dateString;
        }
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getUserStatusIcon = (userStatus) => {
    switch (userStatus) {
      case 'owner':
        return <FaCrown className="status-icon crown-icon" />;
      case 'collaborator':
        return <FaUserFriends className="status-icon collaborator-icon" />;
      case 'participant':
        return <BsPersonFill className="status-icon participant-icon" />;
      default:
        return null; 
    }
  };  
  const getEventImage = () => {
    const imageUrl = formatImageUrl(event.imageUrl || event.photo || event.image);
    if (imageUrl) {
      return <img src={imageUrl} alt={event.name} className="card-image" />;
    }
    
    
    return (
      <div className="default-event-placeholder">
        <div className="placeholder-gradient"></div>
        <div className="placeholder-content">
          <FaCalendarAlt className="placeholder-icon" />
          <span className="placeholder-text">Evento</span>
        </div>
      </div>
    );
  };  return (
    <Link to={linkTo} style={{ textDecoration: 'none' }}>
      <div className={`event-card ${type === 'primary' ? 'primary-card' : 'secondary-card'} ${event.state === 'ACTIVE' ? 'active-event' : ''}`}>
        
        
        {event.state === 'ACTIVE' && (
          <div className="active-indicator">
            <div className="active-pulse"></div>
            <span className="active-text">ATIVO</span>
          </div>
        )}
        
        <div className="card-image-container">
          {getEventImage()}
          <div className="card-image-overlay"></div>
        </div>
          <div className="card-content">
          <div className="card-title">
            {event.name}
          </div>
          <div className="card-date">
            {formatDate(event.dateFixedStart || event.dateStart)}
          </div>
          {type === 'secondary' && event.userStatus === 'visitor' && onParticipate && 
           !event.isActive && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
            <button 
              className="participate-btn"
              onClick={handleParticipateClick}
              title="Participar do evento"
            >
              <FaUserPlus />
              <span>Participar</span>
            </button>
          )}
          

          {type === 'secondary' && event.userStatus === 'visitor' && event.isActive && (
            <div className="event-started-message">
              <span>Evento já iniciado</span>
            </div>
          )}
          

          {type === 'secondary' && event.userStatus === 'visitor' && event.state === 'FINISHED' && (
            <div className="event-finished-message">
              <span>Evento encerrado</span>
            </div>
          )}
          

          {type === 'secondary' && event.userStatus === 'visitor' && event.state === 'CANCELED' && (
            <div className="event-canceled-message">
              <span>Evento cancelado</span>
            </div>
          )}
        </div>{event.userStatus && getUserStatusIcon(event.userStatus) && (
          <div className="card-status-icon">
            {getUserStatusIcon(event.userStatus)}
          </div>
        )}
      </div>
    </Link>
  );
};

// PropTypes for better component documentation and validation
EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    dateFixedStart: PropTypes.string.isRequired,
    timeFixedStart: PropTypes.string.isRequired,
    timeFixedEnd: PropTypes.string,
    localization: PropTypes.string.isRequired,
    description: PropTypes.string,
    maxParticipants: PropTypes.number,
    photo: PropTypes.string,
    userStatus: PropTypes.string,
    access: PropTypes.oneOf(['PUBLIC', 'PRIVATE']),
    status: PropTypes.string,
    organizer: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      login: PropTypes.string
    }),
    participantCount: PropTypes.number,
    isOrganizer: PropTypes.bool
  }).isRequired,
  type: PropTypes.oneOf(['public', 'my', 'participating']),
  linkTo: PropTypes.string,
  onParticipate: PropTypes.func
};

EventCard.defaultProps = {
  type: 'public',
  linkTo: null,
  onParticipate: null
};

export default EventCard;
