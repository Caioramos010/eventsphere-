import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCreateOutline, IoImageOutline, IoArrowBackOutline } from 'react-icons/io5';
import { Header, Footer, PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { useFormState, useFileUpload } from '../hooks/useFormState';
import { DEFAULT_VALUES } from '../constants/index';
import '../styles/CreateEvent.css';


const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const {
    formData,
    loading,
    error,
    success,
    handleChange: handleFormChange,
    setFormError,
    setFormSuccess,
    setFormLoading,
    validateRequired
  } = useFormState({
    name: '',
    dateFixedStart: getTodayDateString(),
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

  
  const {
    file: photoFile,
    preview: photoPreview,
    handleFileChange
  } = useFileUpload();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);
  function handleChange(e) {
    const { name, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      handleFileChange(e);
    } else {
      handleFormChange(e);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    
    
    if (loading || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setFormLoading(true);

    try {
      
      if (!formData.name || formData.name.trim().length < 3) {
        setFormError('Nome do evento deve ter pelo menos 3 caracteres');
        setIsSubmitting(false);
        return;
      }

      if (!formData.localization || formData.localization.trim().length < 3) {
        setFormError('Local do evento deve ter pelo menos 3 caracteres');
        setIsSubmitting(false);
        return;
      }

      if (!formData.timeFixedStart || !formData.timeFixedEnd) {
        setFormError('Horários de início e fim são obrigatórios');
        setIsSubmitting(false);
        return;
      }

      
      const startDate = formData.dateFixedStart;
      const endDate = formData.dateFixedEnd || formData.dateFixedStart;
      const startDateTime = new Date(`${startDate}T${formData.timeFixedStart}`);
      const endDateTime = new Date(`${endDate}T${formData.timeFixedEnd}`);

      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(startDate + 'T00:00:00');
      
      if (selectedDate < today) {
        setFormError('Não é possível criar eventos para datas passadas');
        setIsSubmitting(false);
        return;
      }

      
      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        
        if (startDateTime < tenMinutesAgo) {
          setFormError('O horário de início não pode ser muito no passado');
          setIsSubmitting(false);
          return;
        }
      }

      
      if (startDate === endDate && endDateTime <= startDateTime) {
        setFormError('O horário de término deve ser posterior ao horário de início');
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        name: formData.name,
        dateFixedStart: formData.dateFixedStart,
        dateFixedEnd: formData.dateFixedEnd || formData.dateFixedStart,
        timeFixedStart: formData.timeFixedStart,
        timeFixedEnd: formData.timeFixedEnd,
        localization: formData.localization,
        description: formData.description,
        maxParticipants: parseInt(formData.maxParticipants) || DEFAULT_VALUES.EVENT.MAX_PARTICIPANTS,
        classification: parseInt(formData.classification) || DEFAULT_VALUES.EVENT.DEFAULT_CLASSIFICATION,
        acess: formData.acess,
        photo: null 
      };

      const result = await EventService.createEvent(eventData);

      if (result.success && photoFile) {
        try {
          const uploadResult = await EventService.uploadEventImage(result.event.id, photoFile);
          if (!uploadResult.success) {
            console.warn('Erro ao fazer upload da imagem:', uploadResult.message);
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
        }
      }

      if (result.success) {
        setFormSuccess(result.message || 'Evento criado com sucesso!');
        setTimeout(() => {
          navigate('/main');
        }, 2000);
      } else {
        setFormError(result.message || 'Erro ao criar evento');
      }
    } catch (err) {
      console.error('Create event error:', err);
      setFormError('Erro ao conectar com o servidor');
    } finally {
      setFormLoading(false);
      setIsSubmitting(false);
    }
  }
    return (
    <>      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <BackButton 
              onClick={() => navigate('/main')}
              icon={IoArrowBackOutline}
            />
            
            <PageTitle
              icon={IoCreateOutline}
              title="Criar Evento"
              subtitle="Configure seu novo evento"
              description="Preencha as informações abaixo para criar um novo evento"
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
                    {photoPreview ? 'Clique para alterar a foto' : 'Clique para adicionar uma foto'}
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
                    onChange={handleFormChange}
                    className="modern-input"
                    placeholder="Digite o nome do seu evento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="modern-label">Local *</label>
                  <input
                    type="text"
                    name="localization"
                    value={formData.localization}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    className="modern-textarea"
                    placeholder="Descreva seu evento..."                    maxLength={1000}
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
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
                      className="modern-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Horário de Fim *</label>                      <input
                        type="time"
                        name="timeFixedEnd"
                        value={formData.timeFixedEnd}
                        onChange={handleFormChange}className="modern-input"
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
                        onChange={handleFormChange}
                      className="modern-input"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Classificação Etária</label>                      <select
                        name="classification"
                        value={formData.classification}
                        onChange={handleFormChange}
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
                    <label className="modern-label">Acesso</label>                      <select
                      name="acess"
                      value={formData.acess}
                      onChange={handleFormChange}
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
                loading={loading || isSubmitting}
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) ? 'Criando Evento...' : 'Criar Evento'}
              </StandardButton>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
