import { get, post, put, del, uploadFile } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';
import tempIdManager from '../utils/tempIdManager';

const EventService = {
  
  async getPublicEvents() {
    try {
      // O backend já filtra eventos ativos e ordena por data por padrão
      const url = buildUrl(API_CONFIG.ENDPOINTS.PUBLIC_EVENTS);
      
      const response = await get(url);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        // Verificação de eventos sem ID para debug
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching public events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  
  async getMyEvents() {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.MY_EVENTS);
      
      const response = await get(url);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching my events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  
  async getAllMyEvents() {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ALL_MY_EVENTS);
      const response = await get(url);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching all my events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },



  
  async getEventDetails(eventId, forceFresh = false) {
    try {
      
      if (!eventId) {
        console.error('ID do evento não fornecido');
        return { 
          success: false, 
          message: 'ID do evento não fornecido ou inválido' 
        };
      }
      
      
      if (eventId.startsWith('temp_') && !forceFresh) {
        
        
        return { success: false, message: 'Evento temporário não encontrado' };
      }
      
      
      let url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_GET, { eventID: eventId });
      
      if (forceFresh) {
        url += (url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
      }
      
      const response = await get(url);
      const data = await response.json();
      
      
      if (data.success || response.ok) {
        let event = data.data || data.event || data;
        if (!event.id && eventId) {
          event.id = eventId;
        }
        return { success: true, event };
      } else {
        return { success: false, message: data.message || 'Erro ao buscar evento' };
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  
  
  async createEvent(eventData) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.EVENT_CREATE, eventData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, event: data.data || data.event || data, message: data.message || 'Evento criado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao criar evento' };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async updateEvent(eventId, eventData) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_EDIT, { eventID: eventId });
      const response = await put(url, eventData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, event: data.data || data.event || data, message: data.message || 'Evento atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar evento' };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async deleteEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_DELETE, { eventID: eventId });
      const response = await del(url);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message || 'Evento deletado com sucesso' };
      } else {
        const data = await response.json();
        return { success: false, message: data.message || 'Erro ao deletar evento' };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async generateInviteLink(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_GENERATE, { eventID: eventId });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          inviteToken: data.data.inviteToken,
          inviteUrl: data.data.inviteUrl,
          message: data.message || 'Link de convite gerado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao gerar link de convite' };
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async validateInviteToken(token) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_VALIDATE, { token });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data, message: data.message || 'Token válido' };
      } else {
        return { success: false, message: data.message || 'Token inválido' };
      }
    } catch (error) {
      console.error('Error validating token:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async joinEventByInvite(inviteToken, inviteCode) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.PARTICIPANT_ADD, {
        inviteToken,
        inviteCode
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: data.message || 'Participação confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento' };
      }
    } catch (error) {
      console.error('Error joining event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async uploadEventImage(eventId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('eventID', eventId);
      
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_IMAGE);
      const response = await uploadFile(url, formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          imageUrl: data.data?.imageUrl || data.imageUrl || data.image || data.url,
          message: 'Imagem carregada com sucesso'
        };
      } else {
        return { success: false, message: data.message || 'Erro ao fazer upload da imagem' };
      }
    } catch (error) {
      console.error('Error uploading event image:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async uploadEventPhoto(eventId, photoFile) {
    try {
      if (!photoFile) {
        throw new Error('Arquivo de foto não fornecido');
      }

      const formData = new FormData();
      formData.append('image', photoFile); 
      formData.append('eventID', eventId);  

      const response = await uploadFile(API_CONFIG.ENDPOINTS.EVENT_IMAGE, formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, fileName: data.fileName, imageUrl: data.data?.imageUrl, message: data.message || 'Foto do evento enviada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao enviar foto do evento' };
      }
    } catch (error) {
      console.error('Error uploading event photo:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async searchEvents(filters = {}) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_GET, filters);
      const response = await get(url);
      const data = await response.json();
      return { success: true, events: data.data || data };
    } catch (error) {
      console.error('Error searching events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  
  async startEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_START, { eventID: eventId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento iniciado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao iniciar o evento' };
      }
    } catch (error) {
      console.error('Error starting event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async finishEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_FINISH, { eventID: eventId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento finalizado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao finalizar o evento' };
      }
    } catch (error) {
      console.error('Error finishing event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async cancelEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CANCEL, { eventID: eventId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento cancelado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao cancelar o evento' };
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async removeCollaborator(eventId, userId) {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/collaborator/${userId}`);
      const response = await del(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Colaborador removido com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao remover colaborador' };
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async getParticipatingEvents() {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/event/participating`;
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          events: data.data || data.events || [], 
          message: data.message || 'Eventos carregados com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao carregar eventos', events: [] };
      }
    } catch (error) {
      console.error('Error loading participating events:', error);
      return { success: false, message: error.message || 'Erro de conexão', events: [] };
    }
  },

  
  async validateEventCode(eventCode) {
    try {
      
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CODE_VALIDATE, { eventCode });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data, message: data.message || 'Código válido' };
      } else {
        return { success: false, message: data.message || 'Código inválido' };
      }
    } catch (error) {
      console.error('Error validating event code:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async generateEventCode(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CODE_GENERATE, { eventID: eventId });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          eventCode: data.eventCode || data.data?.eventCode,
          message: data.message || 'Código gerado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao gerar código' };
      }
    } catch (error) {
      console.error('Error generating event code:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async getNextEvents() {
    try {
      // O backend já filtra eventos ativos e ordena por data por padrão
      const url = buildUrl(API_CONFIG.ENDPOINTS.MY_EVENTS);
      
      const response = await get(url);
      const data = await response.json();
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching next events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  
  async getNextPublicEvents() {
    try {
      // O backend já filtra eventos ativos e ordena por data por padrão
      const url = buildUrl(API_CONFIG.ENDPOINTS.PUBLIC_EVENTS);
      
      const response = await get(url);
      const data = await response.json();
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento público sem ID encontrado:', event);
        }
        return event;
      });
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching next public events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },
};

export default EventService;

