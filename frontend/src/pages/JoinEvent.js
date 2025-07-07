import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoEnterOutline, IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLinkOutline, IoCalendarOutline, IoLocationOutline, IoTimeOutline, IoKeyOutline } from 'react-icons/io5';
import { Header, Footer, PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';
import AuthService from '../services/AuthService';
import { useUser } from '../contexts/UserContext';
import '../styles/JoinEvent.css';

export default function JoinEvent() {
  const { token } = useParams();
  const { user, loading } = useUser();
  const [event, setEvent] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [showCodeForm, setShowCodeForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
    if (loading) return;

    
    if (!user) {
      if (token) {
        navigate(`/login?token=${token}`);
      } else {
        navigate('/login');
      }
      return;
    }

    
    if (token) {
      setValidating(true);
      
      setTimeout(() => {
        validateInviteToken(token);
      }, 500);
    } else {
      setShowCodeForm(true);
    }
  }, [navigate, token, user, loading]);

  const validateEventCode = useCallback(async (code) => {
    setValidating(true);
    setError('');
    
    if (!code) {
      setError('Código do evento é obrigatório');
      setValidating(false);
      return;
    }
    
    try {
      const result = await EventService.validateEventCode(code);
      
      if (result.success) {
        setEvent(result.event || result.data);
        setValidating(false);
        setShowCodeForm(false);
      } else {
        setError(result.message || 'Código de evento inválido');
        setValidating(false);
      }
    } catch (err) {
      setError('Erro ao validar código do evento');
      setValidating(false);
    }
  }, []);

  const validateInviteToken = useCallback(async (tokenToValidate = null) => {
    setValidating(true);
    setError('');
    
    const targetToken = tokenToValidate || token;
    if (!targetToken) {
      setError('Token de convite é obrigatório');
      setValidating(false);
      return;
    }
    
    try {
      const result = await EventService.validateInviteToken(targetToken);
      
      if (result.success) {
        setEvent(result.event || result.data);
        setValidating(false);
        setShowCodeForm(false);
      } else {
        setError(result.message || 'Token de convite inválido');
        setValidating(false);
      }
    } catch (err) {
      setError('Erro ao validar token de convite');
      setValidating(false);
    }
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
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
    
    return timeString;
  };

  const handleJoinEvent = async () => {
    setJoining(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (token) {
        result = await ParticipantService.joinEventWithInvite(event.id, token);
      } else {
        result = await ParticipantService.joinEventWithCode(event.id, eventCode);
      }

      if (result.success) {
        setSuccess('Parabéns! Você agora é um participante deste evento.');
        setTimeout(() => {
          navigate(`/event/${event.id}`);
        }, 2000);
      } else {
        setError(result.message || 'Erro ao participar do evento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setJoining(false);
    }
  };

  const handleEventCodeSubmit = (e) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      setError('Por favor, insira um código válido');
      return;
    }
    validateEventCode(eventCode.trim());
  };

  
  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="loading-message">
                <div className="loading-spinner" />
                Carregando...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (validating) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="loading-message">
                <div className="loading-spinner" />
                Validando convite...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !event && !showCodeForm) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="error-message">{error}</div>
              <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <StandardButton 
                  variant="primary"
                  onClick={() => {
                    setError('');
                    setShowCodeForm(true);
                  }}
                >
                  Tentar novamente
                </StandardButton>
                <StandardButton 
                  variant="secondary"
                  onClick={() => navigate('/main')}
                >
                  Voltar para o início
                </StandardButton>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (showCodeForm && !event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="page-header">
              <BackButton onClick={() => navigate('/main')} />
              
              <PageTitle
                icon={IoEnterOutline}
                title="Participar de Evento"
                subtitle="Digite o código do evento"
                description="Insira o código de 8 caracteres que você recebeu do organizador"
              />
            </div>

            <StandardCard variant="glass" padding="large">
              <div className="entry-form-section">
                <div className="form-header">
                  <IoKeyOutline className="form-icon" />
                  <div>
                    <h3>Código do Evento</h3>
                    <p>Digite o código que você recebeu (formato: EV123456)</p>
                  </div>
                </div>

                <form onSubmit={handleEventCodeSubmit} className="entry-form">
                  <div className="form-group">
                    <label htmlFor="eventCode">Código do Evento</label>
                    <input
                      type="text"
                      id="eventCode"
                      value={eventCode}
                      onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                      placeholder="EV123456"
                      className="form-input"
                      disabled={validating}
                      maxLength={8}
                    />
                  </div>

                  {error && <div className="status-message status-error">{error}</div>}

                  <StandardButton
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={validating}
                    disabled={!eventCode.trim()}
                    icon={IoCheckmarkCircleOutline}
                  >
                    {validating ? 'Validando...' : 'Entrar no Evento'}
                  </StandardButton>
                </form>
              </div>

              <div className="entry-help">
                <h4>Como obter o código?</h4>
                <ul>
                  <li><strong>Página de convite:</strong> O organizador pode gerar e compartilhar o código</li>
                  <li><strong>Mensagem direta:</strong> Solicite o código diretamente ao organizador</li>
                  <li><strong>Formato:</strong> O código sempre tem 8 caracteres (ex: EV123456)</li>
                </ul>
              </div>
            </StandardCard>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <BackButton onClick={() => navigate('/main')} />
            
            <PageTitle
              icon={IoEnterOutline}
              title="Convite para Evento"
              subtitle="Você foi convidado para participar"
              size="medium"
            />
          </div>

          {event && (
            <StandardCard variant="glass" padding="large" className="event-details-card">
              <div 
                className="event-header-join" 
                style={{
                  backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
                }}
              >
                <div className="event-header-overlay-join"></div>
                <div className="event-info-join">
                  <h2 className="event-title-join">{event.name}</h2>
                  <div className="event-details-join">
                    <div className="event-detail-item">
                      <IoLocationOutline />
                      <span>{event.location || event.localization || 'Local não informado'}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoCalendarOutline />
                      <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoTimeOutline />
                      <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="join-content">
                {event.description && (
                  <div className="event-description-join">
                    <h3>Sobre o evento</h3>
                    <p>{event.description}</p>
                  </div>
                )}

                <div className="join-section">
                  <h3>Participar do Evento</h3>
                  
                  {event.isActive ? (
                    <div className="event-active-warning">
                      <IoCloseCircleOutline className="warning-icon" />
                      <div>
                        <p><strong>Este evento já foi iniciado</strong></p>
                        <p>Não é mais possível participar deste evento pois ele já começou.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>Clique no botão abaixo para confirmar sua participação neste evento.</p>
                      
                      {error && <div className="status-message status-error">{error}</div>}
                      {success && <div className="status-message status-success">{success}</div>}

                      <StandardButton
                        variant={success ? "success" : "primary"}
                        size="large"
                        fullWidth
                        loading={joining}
                        disabled={success}
                        icon={success ? IoCheckmarkCircleOutline : IoEnterOutline}
                        onClick={handleJoinEvent}
                      >
                        {joining ? 'Participando...' : success ? 'Participação Confirmada!' : 'Confirmar Participação'}
                      </StandardButton>

                      <div className="join-info">
                        <p>
                          <strong>O que acontece depois:</strong>
                        </p>
                        <ul>
                          <li>Você será adicionado à lista de participantes</li>
                          <li>Receberá notificações sobre atualizações do evento</li>
                          <li>Poderá visualizar detalhes completos do evento</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </StandardCard>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
