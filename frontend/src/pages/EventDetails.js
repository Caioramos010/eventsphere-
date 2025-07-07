import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  PageTitle, 
  StandardButton, 
  StandardCard, 
  BackButton,
  ImageModal,
  QRModal,
  ParticipantModal,
  AttendanceModal
} from '../components';
import { 
  IoPeopleOutline, 
  IoPlayOutline, 
  IoCreateOutline, 
  IoCloseOutline, 
  IoRemoveCircleOutline, 
  IoPrintOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline, 
  IoQrCodeOutline, 
  IoStopOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoCheckmarkOutline,
  IoCopyOutline
} from 'react-icons/io5';
import '../styles/EventDetails.css';
import userIcon from '../images/user.png';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';
import EventPrintPage from '../components/EventPrintPage';
import EventAttendancePrintPage from '../components/EventAttendancePrintPage';
import { useDialog } from '../contexts/DialogContext';


const formatDate = (dateString) => {
  if (!dateString) return 'Data não definida';
  
  
  let date;
  if (typeof dateString === 'string') {
    
    if (dateString.includes('T') || !isNaN(Date.parse(dateString))) {
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


const formatTime = (timeString) => {
  if (!timeString) return 'Horário não definido';
  
  
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  
  if (timeString instanceof Date) {
    return timeString.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return timeString; 
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [confirmationList, setConfirmationList] = useState([]);
  const [isEventActive, setIsEventActive] = useState(false);  const [userConfirmed, setUserConfirmed] = useState(false);
  const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);
  const [isLeavingEvent, setIsLeavingEvent] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [showAttendanceReport, setShowAttendanceReport] = useState(false);
  const [showPrintPage, setShowPrintPage] = useState(false);
  const dialog = useDialog();

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        if (!id) {
          setError('ID do evento não especificado');
          setLoading(false);
          return;
        }
        
        let result = await EventService.getEventDetails(id, location.state?.refresh);
        
        if (!result.success && typeof id === 'string' && (id.startsWith('"') || id.startsWith("'"))) {
          const cleanId = id.replace(/['"]/g, '');
          result = await EventService.getEventDetails(cleanId);
        }
        
        if (result.success) {
          if (!result.event.id) {
            result.event.id = id;
          }
          
          const eventData = result.event;
          

          
          setUserConfirmed(eventData.userConfirmed);          
          setIsEventActive(eventData.state === 'ACTIVE');
          
          
          const collaboratorsList = eventData.participants ? 
            eventData.participants
              .filter(participant => participant.isCollaborator)
              .map(collaborator => ({
                id: collaborator.userId,
                name: collaborator.userName || collaborator.userUsername,
                email: collaborator.userEmail,
                imageUrl: collaborator.userPhoto
              }))
            : [];
          
          
          setEvent(eventData);
          setCollaborators(collaboratorsList);
          setConfirmationList(eventData.participants || []);
          
        } else {
          setError(result.message || 'Não foi possível carregar os detalhes do evento');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Erro ao carregar os detalhes do evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id, location.state?.refresh]);

  
  useEffect(() => {
    if (location.state?.refresh) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleInviteClick = () => {
    navigate(`/event/${id}/invite`);
  };

  const handleStartEvent = async () => {
    try {
      const result = await EventService.startEvent(id);
      if (result.success) {
        await dialog.alert('Evento iniciado com sucesso!');
        setIsEventActive(true);
        setEvent(prev => ({...prev, status: 'active', state: 'ACTIVE'}));
        
        // Recarregar os dados do evento para garantir que estão atualizados
        try {
          const updatedEventResult = await EventService.getEventDetails(id, true);
          if (updatedEventResult.success) {
            setEvent(updatedEventResult.event);
            setIsEventActive(updatedEventResult.event.state === 'ACTIVE');
          }
        } catch (refreshError) {
          console.error('Error refreshing event data:', refreshError);
        }
      } else {
        await dialog.alert(result.message || 'Erro ao iniciar o evento');
      }
    } catch (error) {
      console.error('Error starting event:', error);
      await dialog.alert('Erro ao iniciar o evento');
    }
  };

  const handleEndEvent = async () => {
    try {
      const result = await EventService.finishEvent(id);
      if (result.success) {
        await dialog.alert('Evento encerrado com sucesso!');
        setIsEventActive(false);
        setEvent(prev => ({...prev, status: 'finished', state: 'FINISHED'}));
      } else {
        await dialog.alert(result.message || 'Erro ao encerrar o evento');
      }
    } catch (error) {
      console.error('Error ending event:', error);
      await dialog.alert('Erro ao encerrar o evento');
    }
  };

  const handleScanQRCode = () => {
    navigate(`/event/${id}/qr-scanner`);
  };
  const handleEditEvent = () => {
    navigate(`/edit-event/${id}`);
  };

  const handleCancelEvent = async () => {
    const confirmed = await dialog.confirm('Tem certeza que deseja cancelar este evento?');
    if (!confirmed) return;
    try {
      const result = await EventService.cancelEvent(id);
      if (result.success) {
        await dialog.alert('Evento cancelado com sucesso');
        navigate('/main');
      } else {
        await dialog.alert(result.message || 'Erro ao cancelar o evento');
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      await dialog.alert('Erro ao cancelar o evento');
    }
  };  const handleConfirmAttendance = async () => {
    // Verifica se o evento já foi iniciado
    if (event.state !== 'CREATED') {
      await dialog.alert('Não é possível confirmar presença pois o evento já foi iniciado.');
      return;
    }
    
    setIsConfirmingAttendance(true);
    try {
      const result = await ParticipantService.confirmAttendance(id);
      if (result.success) {
        await dialog.alert('Sua presença foi confirmada com sucesso!');
        setUserConfirmed(true);
        

        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
        }
      } else {
        await dialog.alert(result.message || 'Erro ao confirmar sua presença');
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      await dialog.alert('Erro de conexão ao confirmar presença');
    } finally {
      setIsConfirmingAttendance(false);
    }
  };

  const handleLeaveEvent = async () => {
    // Verifica se o evento já foi iniciado
    if (event.state !== 'CREATED') {
      await dialog.alert('Não é possível sair do evento pois ele já foi iniciado.');
      return;
    }

    const confirmed = await dialog.confirm('Tem certeza que deseja sair deste evento? Esta ação não poderá ser desfeita.');
    if (!confirmed) return;

    setIsLeavingEvent(true);
    try {
      const result = await ParticipantService.leaveEvent(id);
      if (result.success) {
        await dialog.alert('Você saiu do evento com sucesso!');
        
        
        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
          setUserConfirmed(false);
        }
        
        
        navigate('/main');
      } else {
        await dialog.alert(result.message || 'Erro ao sair do evento');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      await dialog.alert('Erro de conexão ao sair do evento');
    } finally {
      setIsLeavingEvent(false);
    }
  };
  
  const handleGenerateQRCode = () => {
    
    navigate(`/event/${id}/my-qrcode`);
  };

  const handleJoinEvent = async () => {
    try {
      const result = await ParticipantService.joinPublicEvent(id);
      if (result.success) {
        await dialog.alert('Você agora é um participante deste evento!');
        
        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
        }
      } else {
        await dialog.alert(result.message || 'Erro ao participar do evento');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      await dialog.alert('Erro ao participar do evento');
    }
  };

  const handlePrintList = () => {
    setShowPrintPage(true);
  };

  
  const openParticipantModal = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const closeParticipantModal = () => {
    setSelectedParticipant(null);
    setShowParticipantModal(false);
  };
  const handleRemoveParticipant = async (participantId) => {
    try {
      const result = await ParticipantService.removeParticipant(id, participantId);
      if (result.success) {
        setConfirmationList(prev => prev.filter(p => p.userId !== participantId));
        closeParticipantModal();
        await dialog.alert('Participante removido com sucesso!');
      } else {
        await dialog.alert(result.message || 'Erro ao remover participante');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      await dialog.alert('Erro ao remover participante');
    }
  };

  const handleConfirmParticipant = async (participantId) => {
    try {
      const result = await ParticipantService.confirmParticipant(id, participantId);
      if (result.success) {
        
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, confirmed: true } : p)
        );
        closeParticipantModal();
        await dialog.alert('Participação confirmada com sucesso!');
      } else {
        await dialog.alert(result.message || 'Erro ao confirmar participante');
      }
    } catch (error) {
      console.error('Error confirming participant:', error);
      await dialog.alert('Erro ao confirmar participante');
    }
  };

  const handlePromoteToCollaborator = async (participantId) => {
    try {
      const result = await ParticipantService.promoteToCollaborator(id, participantId);
      if (result.success) {
        
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, isCollaborator: true } : p)
        );
        
        
        const eventResult = await EventService.getEventDetails(id);
        if (eventResult.success) {
          setEvent(eventResult.event);
          setConfirmationList(eventResult.event.participants || []);
          
          
          const collaboratorsList = eventResult.event.participants ? 
            eventResult.event.participants
              .filter(participant => participant.isCollaborator)
              .map(collaborator => ({
                id: collaborator.userId,
                name: collaborator.userName || collaborator.userUsername,
                email: collaborator.userEmail,
                imageUrl: collaborator.userPhoto
              }))
            : [];
          setCollaborators(collaboratorsList);
        }
        
        closeParticipantModal();
        await dialog.alert('Participante promovido a colaborador com sucesso!');
      } else {
        await dialog.alert(result.message || 'Erro ao promover participante');
      }
    } catch (error) {
      console.error('Error promoting participant:', error);
      await dialog.alert('Erro ao promover participante');
    }
  };

  const handleDemoteCollaborator = async (participantId) => {
    try {
      const result = await ParticipantService.demoteCollaborator(id, participantId);
      if (result.success) {
        
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, isCollaborator: false } : p)
        );
        
        
        const eventResult = await EventService.getEventDetails(id);
        if (eventResult.success) {
          setEvent(eventResult.event);
          setConfirmationList(eventResult.event.participants || []);
          
          
          const collaboratorsList = eventResult.event.participants ? 
            eventResult.event.participants
              .filter(participant => participant.isCollaborator)
              .map(collaborator => ({
                id: collaborator.userId,
                name: collaborator.userName || collaborator.userUsername,
                email: collaborator.userEmail,
                imageUrl: collaborator.userPhoto
              }))
            : [];
          setCollaborators(collaboratorsList);
        }
        
        closeParticipantModal();
        await dialog.alert('Colaborador removido com sucesso!');
      } else {
        await dialog.alert(result.message || 'Erro ao remover colaborador');
      }
    } catch (error) {
      console.error('Error demoting collaborator:', error);
      await dialog.alert('Erro ao remover colaborador');
    }
  };

  
  const generateQrCode = async () => {
    try {
      const result = await ParticipantService.generateQrCode(id);
      if (result.success) {
        setQrCode(result.data);
        setShowQrModal(true);
      } else {
        await dialog.alert(result.message || 'Erro ao gerar QR Code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      await dialog.alert('Erro ao gerar QR Code');
    }
  };

  const loadAttendanceReport = async () => {
    try {
      const result = await ParticipantService.getAttendanceReport(id);
      if (result.success) {
        setAttendanceReport(result.data);
        setShowAttendanceReport(true);
      } else {
        await dialog.alert(result.message || 'Erro ao carregar relatório');
      }
    } catch (error) {
      console.error('Error loading attendance report:', error);
      await dialog.alert('Erro ao carregar relatório');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Carregando...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                {error}
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <button className="modern-btn" onClick={() => navigate('/main')}>
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Evento não encontrado
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <button className="modern-btn" onClick={() => navigate('/main')}>
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  
  let isCollaborator = false;
  let isOwner = false;
  let currentUserId = localStorage.getItem('userId');
  if (!currentUserId && window.__USER_CONTEXT__ && window.__USER_CONTEXT__.userId) {
    currentUserId = window.__USER_CONTEXT__.userId;
  }
  let currentParticipant = null;
  if (event && event.participants && Array.isArray(event.participants)) {
    currentParticipant = event.participants.find(p => String(p.userId) === String(currentUserId));
    isCollaborator = !!(currentParticipant && currentParticipant.isCollaborator);
    isOwner = event.ownerId && String(event.ownerId) === String(currentUserId);
  }
  
  const canEdit = event && typeof event.canEdit === 'boolean' ? event.canEdit : (isOwner || isCollaborator);
  if (showPrintPage && event && confirmationList) {
    return <EventPrintPage event={event} participants={confirmationList} />;
  }
  if (showAttendanceReport && attendanceReport && showPrintPage) {
    return <EventAttendancePrintPage event={event} attendanceReport={attendanceReport} />;
  }
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">            <BackButton onClick={() => navigate('/main')} />
            
            <PageTitle
              icon={IoCalendarOutline}
              title="Detalhes do Evento"
              subtitle="Gerencie seu evento"
              description="Visualize informações e gerencie participantes"
            />
          </div>                    
          <StandardCard 
            variant="glass" 
            padding="large"
            className={`event-details-main ${isEventActive ? 'event-active' : ''}`}
          >
            <div className="event-status-container">
              {isEventActive ? (
                <div className="event-active-badge">
                  <div className="event-active-pulse"></div>
                  <span>EVENTO ATIVO</span>
                </div>
              ) : event.state === 'CANCELED' ? (
                <div className="event-cancelled-badge">
                  <span>EVENTO CANCELADO</span>
                </div>
              ) : event.state === 'FINISHED' ? (
                <div className="event-finished-badge">
                  <span>EVENTO ENCERRADO</span>
                </div>
              ) : null}
            </div>
            
            <div 
              className="event-header-with-image" 
              style={{
                backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
              }}
              onClick={() => event.photo && setShowImageModal(true)}
            >
              <div className="event-header-overlay"></div>              <div className="event-header">
                <div className="event-header-left">
                  <h2 className="event-title">{event.name}</h2>
                </div>
                <div className="event-access-badge">
                  {event.access === 'PUBLIC'
                    ? 'PÚBLICO'
                    : event.access === 'PRIVATE'
                    ? 'PRIVADO'
                    : (event.access || 'PÚBLICO')}
                </div>
              </div>
            </div>
            
            <div className="event-content">
              <div className="event-info">
                <div className="event-info-item">
                  <IoLocationOutline />
                  <span>{event.location || event.localization || 'Local não informado'}</span>
                </div>
                <div className="event-info-item">
                  <IoCalendarOutline />
                  <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                </div>
                <div className="event-info-item">
                  <IoTimeOutline />
                  <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                </div>
                <div className="event-info-item">
                  <IoInformationCircleOutline />
                  <span>{event.classification || event.ageRestriction || 'Livre'}</span>
                </div>
                
                <div className="event-description">
                  <h3>Descrição</h3>
                  <p>{event.description || 'Sem descrição'}</p>
                </div>
                
                {(event.maxParticipants || event.confirmedParticipants || event.participants) && (
                  <div className="event-capacity">
                    <div className="capacity-text">
                      <span className="capacity-confirmed">{event.confirmedParticipants || (event.participants ? event.participants.length : 0)}</span>
                      <span className="capacity-separator">/</span>
                      <span className="capacity-total">{event.maxParticipants || 'Ilimitado'}</span>
                    </div>
                    {event.maxParticipants > 0 && (
                      <div className="capacity-bar">
                        <div 
                          className="capacity-progress" 
                          style={{width: `${(event.confirmedParticipants || (event.participants ? event.participants.length : 0)) / event.maxParticipants * 100}%`}}
                        ></div>
                      </div>
                    )}
                  </div>
                )}              </div>
                <div className="event-actions">
                {(canEdit || event.access === 'PUBLIC') && event.state !== 'CANCELED' && event.state !== 'FINISHED' && (
                  <StandardButton
                    variant="primary"
                    size="medium"
                    icon={IoPeopleOutline}
                    onClick={handleInviteClick}
                    className="event-action-btn"
                  >
                    Convidar Pessoas
                  </StandardButton>
                )}
                {canEdit && (
                  <>                    {event.state === 'CREATED' ? (
                      <>                        
                        <StandardButton
                          variant="success"
                          size="medium"
                          icon={IoPlayOutline}
                          onClick={handleStartEvent}
                          className="event-action-btn start-btn"
                        >
                          Iniciar Evento
                        </StandardButton>
                        <StandardButton
                          variant="primary"
                          size="medium"
                          icon={IoCreateOutline}
                          onClick={handleEditEvent}
                          className="event-action-btn edit-btn"
                        >
                          Editar Evento
                        </StandardButton>
                        <StandardButton
                          variant="danger"
                          size="medium"
                          icon={IoCloseOutline}
                          onClick={handleCancelEvent}
                          className="event-action-btn cancel-btn"
                        >
                          Cancelar Evento
                        </StandardButton>
                      </>
                    ) : event.state === 'ACTIVE' ? (
                      <>
                        <button className="modern-btn event-action-btn qrcode-btn" onClick={handleScanQRCode}>
                          <IoQrCodeOutline />
                          <span>Escanear QR-Code</span>
                        </button>
                        <button className="modern-btn event-action-btn end-btn" onClick={handleEndEvent}>
                          <IoStopOutline />
                          <span>Encerrar Evento</span>
                        </button>
                      </>
                    ) : null}
                  </>                )}
                {!canEdit && event.userStatus === 'participant' && event.state === 'ACTIVE' && (
                  <button className="modern-btn event-action-btn qr-btn" onClick={generateQrCode}>
                    <IoQrCodeOutline />
                    <span>Meu QR Code</span>
                  </button>
                )}
                {canEdit && event.state === 'FINISHED' && (
                  <button className="modern-btn event-action-btn report-btn" onClick={loadAttendanceReport}>
                    <IoCheckmarkCircleOutline />
                    <span>Relatório de Presença</span>
                  </button>
                )}
                {!canEdit && (event.userIsCollaborator || event.ownerId === event.currentUserId) && event.state === 'FINISHED' && (
                  <button className="modern-btn event-action-btn report-btn" onClick={loadAttendanceReport}>
                    <IoCheckmarkCircleOutline />
                    <span>Relatório de Presença</span>
                  </button>
                )}
                  {!canEdit && event.userStatus === 'participant' && !userConfirmed && event.state === 'CREATED' && (
                  <button 
                    className="modern-btn event-action-btn confirm-btn" 
                    onClick={handleConfirmAttendance}
                    disabled={isConfirmingAttendance}
                  >
                    <IoCheckmarkOutline />
                    <span>{isConfirmingAttendance ? 'Confirmando...' : 'Confirmar Presença'}</span>
                  </button>
                )}

                {!canEdit && event.userStatus === 'participant' && event.state === 'CREATED' && (
                  <button 
                    className="modern-btn event-action-btn leave-btn" 
                    onClick={handleLeaveEvent}
                    disabled={isLeavingEvent}
                  >
                    <IoRemoveCircleOutline />
                    <span>{isLeavingEvent ? 'Saindo...' : 'Sair do Evento'}</span>
                  </button>
                )}
                
                {event.userStatus === 'visitor' && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
                  <button className="modern-btn event-action-btn join-btn" onClick={handleJoinEvent}>
                    <IoPeopleOutline />
                    <span>Participar do Evento</span>
                  </button>
                )}
              </div>
            </div>
          </StandardCard>

          {canEdit && confirmationList && confirmationList.length > 0 && (
            <StandardCard variant="glass" padding="large">
              <div className="section-header">
                <h3>Lista de Participantes ({confirmationList.length})</h3>
                <button className="modern-btn-secondary small-btn" onClick={handlePrintList}>
                  <IoPrintOutline />
                  <span>Imprimir</span>
                </button>
              </div>
                <div className="participant-list">
                {confirmationList.map(participant => (
                  <div 
                    key={participant.id || `part-${Math.random()}`} 
                    className="participant-item clickable"
                    onClick={() => openParticipantModal(participant)}
                  ><div className="participant-avatar">
                      <img src={
                        participant.userPhoto 
                          ? (participant.userPhoto.startsWith('data:') ? participant.userPhoto : `data:image/jpeg;base64,${participant.userPhoto}`)
                          : userIcon
                      } alt="User" />
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {participant.userName || participant.userUsername || 'Participante'}
                        {event.ownerId === participant.userId && (
                          <span className="owner-badge">Dono</span>
                        )}
                        {participant.isCollaborator && event.ownerId !== participant.userId && (
                          <span className="collaborator-badge">Colaborador</span>
                        )}
                      </div>
                      <div className="participant-details">
                        {participant.userEmail && <span>{participant.userEmail}</span>}
                      </div>
                    </div>
                    <div className={`participant-status ${participant.confirmed ? 'confirmed' : 'not-confirmed'}`}>
                      {participant.confirmed ? 
                        <IoCheckmarkCircleOutline /> : 
                        <IoCloseCircleOutline />
                      }
                    </div>
                  </div>
                ))}
              </div>
                <div className="list-footer">
                <span>Confirmados: {confirmationList.filter(p => p.confirmed).length}</span>
                <span>Pendentes: {confirmationList.filter(p => !p.confirmed).length}</span>
              </div>
            </StandardCard>
          )}</div>
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={event.photo ? (event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`) : null}
        title={event.name}
        description="Imagem do evento"
      />
      
      <ParticipantModal
        isOpen={showParticipantModal}
        onClose={closeParticipantModal}
        participant={selectedParticipant}
        event={event}
        onConfirmParticipant={handleConfirmParticipant}
        onPromoteToCollaborator={handlePromoteToCollaborator}
        onDemoteCollaborator={handleDemoteCollaborator}
        onRemoveParticipant={handleRemoveParticipant}
      />
      
      <QRModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrCodeData={qrCode}
        eventName={event.name}
        onCopyCode={dialog.alert}
      />
      
      <AttendanceModal
        isOpen={showAttendanceReport}
        onClose={() => setShowAttendanceReport(false)}
        attendanceReport={attendanceReport ? {
          eventName: attendanceReport.eventName,
          presentList: attendanceReport.presentParticipants,
          absentList: attendanceReport.absentParticipants
        } : null}
        onPrintReport={() => setShowPrintPage(true)}
      />
      
      <Footer />
    </>
  );
};

export default EventDetails;
