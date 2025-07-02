import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoCreateOutline, IoImageOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import { useFormState, useFileUpload } from '../hooks/useFormState';
import { validateEventData } from '../utils/validators';
import { DEFAULT_VALUES } from '../constants/index';
import EventService from '../services/EventService';
import '../styles/Main.css';import '../styles/CreateEvent.css';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    formData,
    loading,
    error,
    success,
    handleChange: handleFormChange,
    setForm,
    setFormError,
    setFormSuccess,
    setFormLoading
  } = useFormState({
    name: '',
    dateFixedStart: '',
    dateFixedEnd: '',
    timeFixedStart: '',
    timeFixedEnd: '',
    localization: '',
    description: '',
    maxParticipants: DEFAULT_VALUES.EVENT.MAX_PARTICIPANTS,
    classification: DEFAULT_VALUES.EVENT.DEFAULT_CLASSIFICATION,
    acess: DEFAULT_VALUES.EVENT.DEFAULT_ACCESS,
    photo: ''
  });

  // File upload state using custom hook
  const {
    file: photoFile,
    preview: photoPreview,
    handleFileChange,
    setPreview
  } = useFileUpload();

  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoadingEvent(true);
        setFormError('');
        
        const result = await EventService.getEventDetails(id);
        
        if (result.success && result.event) {
          const event = result.event;
          
          setForm({
            name: event.name || '',
            dateFixedStart: event.dateFixedStart || '',
            dateFixedEnd: event.dateFixedEnd || '',
            timeFixedStart: event.timeFixedStart || '',
            timeFixedEnd: event.timeFixedEnd || '',
            localization: event.localization || '',
            description: event.description || '',
            maxParticipants: event.maxParticipants || DEFAULT_VALUES.EVENT.MAX_PARTICIPANTS,
            classification: event.classification || DEFAULT_VALUES.EVENT.DEFAULT_CLASSIFICATION,
            acess: event.acess || DEFAULT_VALUES.EVENT.DEFAULT_ACCESS,
            photo: event.photo || ''
          });
          
          if (event.photo) {
            setPreview(event.photo);
          }
          
        } else {
          setFormError(result.message || 'Erro ao carregar dados do evento');
        }
      } catch (err) {
        console.error('Erro ao carregar evento:', err);
        setFormError('Erro ao conectar com o servidor');
      } finally {
        setLoadingEvent(false);
      }
    }
    
    if (id) {
      loadEvent();
    } else {
      setFormError('ID do evento não fornecido');
      setLoadingEvent(false);
    }
  }, [id, setForm, setFormError, setPreview]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      handleFileChange(e);
    } else {
      handleFormChange(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    
    try {
      const validationResult = validateEventData(formData);
      if (!validationResult.isValid) {
        setFormError(validationResult.errors.join(', '));
        setFormLoading(false);
        return;
      }
      
      const eventData = {
        name: formData.name,
        dateFixedStart: formData.dateFixedStart,
        dateFixedEnd: formData.dateFixedEnd,
        timeFixedStart: formData.timeFixedStart,
        timeFixedEnd: formData.timeFixedEnd,
        localization: formData.localization,
        description: formData.description,
        maxParticipants: parseInt(formData.maxParticipants),
        classification: parseInt(formData.classification),
        acess: formData.acess
      };
      
      const result = await EventService.updateEvent(id, eventData);
      
      if (result.success) {
        if (photoFile) {
          const uploadResult = await EventService.uploadEventImage(id, photoFile);
          if (uploadResult.success) {
            if (uploadResult.imageUrl) {
              setPreview(uploadResult.imageUrl);
            }
          } else {
            console.warn('Erro ao fazer upload da imagem:', uploadResult.message);
          }
        }
        
        setFormSuccess('Evento atualizado com sucesso!');
        setTimeout(() => {
          // Força a atualização dos dados na página de detalhes
          navigate(`/event/${id}`, { state: { refresh: true } });
        }, 1500);
      } else {
        setFormError(result.message || 'Erro ao atualizar evento');
      }
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      setFormError('Erro ao conectar com o servidor');
    } finally {
      setFormLoading(false);
    }
  }

  if (loadingEvent) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="page-header">
              <BackButton 
                onClick={() => navigate(`/event/${id}`)}
                icon={IoArrowBackOutline}
                aria-label="Voltar para detalhes do evento"
              />
              <div className="header-content">
                <h1>Editar Evento</h1>
                <div className="subtitle">Carregando dados...</div>
              </div>
            </div>
            
            <div className="glass-card">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="loading-spinner"></div>
                <p>Carregando dados do evento...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
        <>      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <BackButton 
              onClick={() => navigate(`/event/${id}`)}
              icon={IoArrowBackOutline}
            />
            
            <PageTitle
              icon={IoCreateOutline}
              title="Editar Evento"
              subtitle="Atualize as informações do evento"
              description="Modifique as informações abaixo para atualizar o evento"
            />
          </div>

          <div className="content-wrapper">
            <form className="modern-form" onSubmit={handleSubmit}>
              
              <StandardCard variant="glass" padding="large">
                <label className="upload-area" htmlFor="photo-input">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <IoImageOutline className="upload-icon" />
                    </div>
                  )}
                  <div className="upload-text">
                    {photoPreview ? 'Clique para alterar a foto do evento' : 'Clique para adicionar uma foto ao evento'}
                  </div>
                  <input
                    id="photo-input"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden-input"
                  />                </label>              </StandardCard>
              
              <StandardCard variant="glass" padding="large">
                <h3 className="card-title">Informações Básicas</h3>
                
                <div className="form-group">
                  <label className="modern-label">Nome do Evento *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite o nome do evento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="modern-label">Local *</label>
                  <input
                    type="text"
                    name="localization"
                    value={formData.localization}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite o local do evento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="modern-label">Descrição</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="modern-textarea"
                    placeholder="Descreva o evento..."
                    maxLength={1000}
                  />
                </div>              </StandardCard>
              
              <StandardCard variant="glass" padding="large">
                <h3 className="card-title">Data e Horário</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="modern-label">Data de Início *</label>                      <input
                        type="date"
                        name="dateFixedStart"
                        value={formData.dateFixedStart}
                        onChange={handleChange}
                      className="modern-input"
                      min={getTodayDateString()}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Data de Fim</label>                      <input
                        type="date"
                        name="dateFixedEnd"
                        value={formData.dateFixedEnd}
                        onChange={handleChange}
                        className="modern-input"
                        min={formData.dateFixedStart || getTodayDateString()}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="modern-label">Horário de Início *</label>                      <input
                        type="time"
                        name="timeFixedStart"
                        value={formData.timeFixedStart}
                        onChange={handleChange}
                      className="modern-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Horário de Fim *</label>                      <input
                        type="time"
                        name="timeFixedEnd"
                        value={formData.timeFixedEnd}
                        onChange={handleChange}className="modern-input"
                      required
                    />
                  </div>
                </div>              </StandardCard>
              
              <StandardCard variant="glass" padding="large">
                <h3 className="card-title">Configurações</h3>
                
                <div className="form-row-three">
                  <div className="form-group">
                    <label className="modern-label">Limite de Participantes *</label>                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                      className="modern-input"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Classificação Etária</label>                      
                    <select
                        name="classification"
                        value={formData.classification}
                        onChange={handleChange}
                      className="modern-select"
                    >
                      <option value={0}>Livre</option>
                      <option value={10}>10 anos</option>
                      <option value={12}>12 anos</option>
                      <option value={14}>14 anos</option>
                      <option value={16}>16 anos</option>
                      <option value={18}>18 anos</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Acesso</label>                      
                    <select
                      name="acess"
                      value={formData.acess}
                      onChange={handleChange}
                      className="modern-select"
                    >
                      <option value="PUBLIC">Público</option>
                      <option value="PRIVATE">Privado</option>
                    </select>
                  </div>
                </div>
              </StandardCard>
              

              {error && <div className="status-message status-error">{error}</div>}
              {success && <div className="status-message status-success">{success}</div>}

              
              <StandardButton
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Atualizando Evento...' : 'Atualizar Evento'}
              </StandardButton>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
