import React from 'react';
import StandardModal from './StandardModal';
import PropTypes from 'prop-types';
import { 
  IoCheckmarkOutline, 
  IoPeopleOutline, 
  IoRemoveCircleOutline,
  IoInformationCircleOutline 
} from 'react-icons/io5';
import userIcon from '../images/user.png';

const ParticipantModal = ({ 
  isOpen, 
  onClose, 
  participant,
  event,
  onConfirmParticipant,
  onPromoteToCollaborator,
  onDemoteCollaborator,
  onRemoveParticipant,
  className = ''
}) => {
  if (!isOpen || !participant) return null;

  const isEventModifiable = event.state === 'CREATED';
  const isOwner = event.userStatus === 'owner';
  const isParticipantOwner = event.ownerId === participant.userId;

  const handleAction = (action, userId) => {
    if (action && typeof action === 'function') {
      action(userId);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Participante: {participant.userName || participant.userEmail}
          {isParticipantOwner && (
            <span style={{
              background: 'var(--color-warning)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Dono
            </span>
          )}
          {participant.isCollaborator && !isParticipantOwner && (
            <span style={{
              background: 'var(--color-info)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Colaborador
            </span>
          )}
        </div>
      }
      variant="participant"
      size="medium"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      className={className}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px' 
        }}>
          <img 
            src={
              participant.userPhoto 
                ? (participant.userPhoto.startsWith('data:') ? participant.userPhoto : `data:image/jpeg;base64,${participant.userPhoto}`)
                : userIcon
            } 
            alt="User" 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--color-primary)',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
            }}
          />
        </div>
        
        <div style={{ 
          color: 'var(--color-text-white)',
          marginBottom: '30px' 
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Email:</strong> {participant.userEmail}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Status:</strong> {participant.confirmed ? 'Confirmado' : 'Pendente'}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            ...(participant.confirmed 
              ? {
                  backgroundColor: 'rgba(39, 174, 96, 0.2)',
                  color: 'var(--color-success)',
                  border: '1px solid rgba(39, 174, 96, 0.3)'
                }
              : {
                  backgroundColor: 'rgba(231, 76, 60, 0.2)',
                  color: 'var(--color-danger)',
                  border: '1px solid rgba(231, 76, 60, 0.3)'
                }
            )
          }}>
            {participant.confirmed ? 'Confirmado' : 'Não confirmado'}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {!isEventModifiable && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.2)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: 'var(--color-warning)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IoInformationCircleOutline />
              <span>
                {event.state === 'CANCELED' ? 'Evento cancelado - nenhuma ação disponível' :
                 event.state === 'ACTIVE' ? 'Evento ativo - modificações não permitidas' :
                 'Evento encerrado - modificações não permitidas'}
              </span>
            </div>
          )}
          
          {isEventModifiable && (
            <>
              {!participant.confirmed && (
                <button 
                  className="modern-btn" 
                  onClick={() => handleAction(onConfirmParticipant, participant.userId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IoCheckmarkOutline />
                  <span>Confirmar Participação</span>
                </button>
              )}
              
              {!participant.isCollaborator && isOwner && !isParticipantOwner && (
                <button 
                  className="modern-btn" 
                  onClick={() => handleAction(onPromoteToCollaborator, participant.userId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IoPeopleOutline />
                  <span>Promover a Colaborador</span>
                </button>
              )}
              
              {participant.isCollaborator && isOwner && !isParticipantOwner && (
                <button 
                  className="modern-btn" 
                  onClick={() => handleAction(onDemoteCollaborator, participant.userId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IoRemoveCircleOutline />
                  <span>Remover como Colaborador</span>
                </button>
              )}
              
              {!isParticipantOwner && (
                <button 
                  className="modern-btn remove-btn" 
                  onClick={() => handleAction(onRemoveParticipant, participant.userId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    background: 'var(--color-danger)',
                    color: 'white'
                  }}
                >
                  <IoRemoveCircleOutline />
                  <span>Remover Participante</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </StandardModal>
  );
};

ParticipantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  participant: PropTypes.shape({
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userName: PropTypes.string,
    userEmail: PropTypes.string.isRequired,
    userPhoto: PropTypes.string,
    confirmed: PropTypes.bool,
    isCollaborator: PropTypes.bool
  }),
  event: PropTypes.shape({
    state: PropTypes.string.isRequired,
    userStatus: PropTypes.string.isRequired,
    ownerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  onConfirmParticipant: PropTypes.func,
  onPromoteToCollaborator: PropTypes.func,
  onDemoteCollaborator: PropTypes.func,
  onRemoveParticipant: PropTypes.func,
  className: PropTypes.string
};

export default ParticipantModal;
