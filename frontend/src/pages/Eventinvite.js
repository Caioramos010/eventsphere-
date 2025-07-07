import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from '../components/Link';
import { Header, Footer, PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import { IoArrowBack, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoLinkOutline, IoCopyOutline, IoCheckmarkOutline, IoQrCodeOutline, IoShareOutline, IoKeyOutline } from 'react-icons/io5';
import '../styles/EventInvite.css';
import EventService from '../services/EventService';

const EventInvite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEventAndGenerateInvite = async () => {
      try {
        setLoading(true);
        setError(''); // Limpar erros anteriores
        
        console.log('Carregando evento...', id);
        const eventResult = await EventService.getEventDetails(id);
        if (!eventResult.success) {
          setError(eventResult.message || 'Evento não encontrado');
          return;
        }
        
        console.log('Evento carregado:', eventResult.event);
        setEvent(eventResult.event);
        
        // Gerar/obter o link de convite
        console.log('Gerando link de convite...');
        const inviteResult = await EventService.generateInviteLink(id);
        if (inviteResult.success) {
          console.log('Link gerado:', inviteResult.inviteUrl);
          setInviteUrl(inviteResult.inviteUrl);
        } else {
          setError(inviteResult.message || 'Erro ao gerar link de convite');
          return;
        }

        // Gerar/obter o código do evento separadamente
        console.log('Gerando código do evento...');
        setLoadingCode(true);
        const codeResult = await EventService.generateEventCode(id);
        if (codeResult.success && codeResult.eventCode) {
          console.log('Código gerado:', codeResult.eventCode);
          setEventCode(codeResult.eventCode);
        } else {
          console.warn('Erro ao gerar código do evento:', codeResult.message);
          // Se falhar, tenta usar o código que já existia no evento (fallback)
          const fallbackCode = eventResult.event.inviteCode || eventResult.event.eventCode || '';
          console.log('Usando código de fallback:', fallbackCode);
          setEventCode(fallbackCode);
        }
        setLoadingCode(false);
      } catch (error) {
        console.error('Error loading event and invite:', error);
        setError('Erro ao carregar dados do evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEventAndGenerateInvite();
    }
  }, [id]);  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      
      try {
        const textArea = document.createElement('textarea');
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Erro no fallback de cópia:', fallbackError);
      }
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(eventCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
      
      try {
        const textArea = document.createElement('textarea');
        textArea.value = eventCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyCodeSuccess(true);
        setTimeout(() => setCopyCodeSuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Erro no fallback de cópia:', fallbackError);
      }
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Convite para: ${event.name}`,
          text: `Você foi convidado para participar do evento "${event.name}"`,
          url: inviteUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      
      handleCopyLink();
    }
  };

  
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
  };  const handleRegenerateCode = async () => {
    try {
      setLoadingCode(true);
      setError('');
      console.log('Regenerando código do evento...');
      
      const codeResult = await EventService.generateEventCode(id);
      if (codeResult.success && codeResult.eventCode) {
        console.log('Código regenerado:', codeResult.eventCode);
        setEventCode(codeResult.eventCode);
      } else {
        console.error('Erro ao regenerar código:', codeResult.message);
        setError('Erro ao regenerar código do evento');
      }
    } catch (error) {
      console.error('Error regenerating code:', error);
      setError('Erro ao regenerar código do evento');
    } finally {
      setLoadingCode(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <StandardCard variant="glass" padding="large">
              <div className="loading-message">Carregando...</div>
            </StandardCard>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <StandardCard variant="glass" padding="large">
              <div className="error-message">{error || 'Evento não encontrado'}</div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <StandardButton 
                  variant="primary" 
                  onClick={() => navigate('/main')}
                >
                  Voltar para o início
                </StandardButton>
              </div>
            </StandardCard>
          </div>
        </div>
        <Footer />
      </>
    );
  }  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <BackButton onClick={() => navigate(`/event/${id}`)} />
            <PageTitle 
              title="Convite do Evento" 
              subtitle="Compartilhe com seus convidados"
              icon={IoShareOutline}
            />
          </div>

          <StandardCard variant="glass" padding="large" className="event-invite-card">
            <div 
              className="event-header-mini" 
              style={{
                backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
              }}
            >
              <div className="event-header-overlay-mini"></div>
              <div className="event-info-mini">
                <h2 className="event-title-mini">{event.name}</h2>
                <div className="event-details-mini">
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

            <div className="invite-content">
              <div className="invite-section">
                <h3><IoKeyOutline /> Código do Evento</h3>
                <p className="section-description">
                  Seus convidados podem usar este código para participar do evento
                </p>
                <div className="code-container">
                  <div className="code-display">
                    <span className="code-text">
                      {loadingCode ? 'Gerando código...' : (eventCode || 'Código não disponível')}
                    </span>
                  </div>
                  <div className="code-actions">
                    <StandardButton
                      variant={copyCodeSuccess ? "success" : "secondary"}
                      size="medium"
                      icon={copyCodeSuccess ? IoCheckmarkOutline : IoCopyOutline}
                      onClick={handleCopyCode}
                      className="copy-code-btn"
                      disabled={loadingCode || !eventCode}
                    >
                      {copyCodeSuccess ? 'Copiado!' : 'Copiar Código'}
                    </StandardButton>
                    {!eventCode && !loadingCode && (
                      <StandardButton
                        variant="primary"
                        size="medium"
                        icon={IoKeyOutline}
                        onClick={handleRegenerateCode}
                        className="regenerate-code-btn"
                      >
                        Gerar Código
                      </StandardButton>
                    )}
                  </div>
                </div>
              </div>

              <div className="invite-section">
                <h3><IoLinkOutline /> Link de Convite</h3>
                <p className="section-description">
                  Link direto para participar do evento
                </p>
                <div className="url-container">
                  <div className="url-display">
                    <span className="url-text">{inviteUrl}</span>
                    <button 
                      className="url-icon-btn"
                      onClick={handleCopyLink}
                      title="Copiar link"
                    >
                      {copySuccess ? <IoCheckmarkOutline /> : <IoLinkOutline />}
                    </button>
                  </div>
                  
                  <div className="action-buttons-link">
                    <StandardButton
                      variant={copySuccess ? "success" : "secondary"}
                      size="medium"
                      icon={copySuccess ? IoCheckmarkOutline : IoCopyOutline}
                      onClick={handleCopyLink}
                    >
                      {copySuccess ? 'Copiado!' : 'Copiar Link'}
                    </StandardButton>
                    
                    <StandardButton
                      variant="primary"
                      size="medium"
                      icon={IoShareOutline}
                      onClick={handleShareLink}
                    >
                      Compartilhar
                    </StandardButton>
                  </div>
                </div>
              </div>

              <div className="invite-instructions">
                <h4>Como seus convidados podem participar:</h4>
                <ul>
                  <li><strong>Pelo código:</strong> Acesse "Participar de um Evento" e digite o código <strong>{eventCode}</strong></li>
                  <li><strong>Pelo link:</strong> Clique diretamente no link de convite</li>
                  <li><strong>Notificações:</strong> Você receberá avisos quando alguém confirmar presença</li>
                </ul>
              </div>
            </div>
          </StandardCard>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventInvite;
