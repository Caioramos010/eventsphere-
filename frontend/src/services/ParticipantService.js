
import { get, post, put } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';
import { handleServiceError } from '../utils/errorHandler';

const ParticipantService = {
  
  async inviteParticipant(eventId, participantData) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_INVITE), {
        eventId: eventId,
        ...participantData
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Convite enviado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao enviar convite' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao enviar convite');
    }
  },
  
  async updateParticipantStatus(participantId, status) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_STATUS_UPDATE, { participantId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Status atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar status' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao atualizar status');
    }
  },
  
    async confirmAttendance(eventId) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.PARTICIPANT_CONFIRM, { eventId });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar presença' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao confirmar presença');
    }
  },

  
  async getEventParticipants(eventId) {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.EVENT_GET}/participants`, { id: eventId });
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, participants: data };
    } catch (error) {
      return handleServiceError(error, 'Erro ao buscar participantes', { participants: [] });
    }
  },

  
  async confirmPresence(eventId) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/confirm`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar presença' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao confirmar presença');
    }
  },

  
  async cancelParticipation(eventId) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/cancel`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação cancelada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao cancelar participação' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao cancelar participação');
    }
  },

  
  async markPresenceByQR(qrCode) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/qr-presence`, { qrCode });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença marcada com sucesso', event: data.event };
      } else {
        return { success: false, message: data.message || 'QR Code inválido' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao marcar presença por QR');
    }
  },

  
  async markPresenceByToken(token) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_PRESENCE, { token }), {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença marcada com sucesso', data: data.data };
      } else {
        return { success: false, message: data.message || 'Token inválido' };
      }
    } catch (error) {
      // Se o erro for de participante já presente, propaga sem modificar
      if (error.isParticipantAlreadyPresent) {
        throw error;
      }
      return handleServiceError(error, 'Erro ao marcar presença por token');
    }
  },
  
  async getParticipantStats(eventId) {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.EVENT_GET}/participants/stats`, { id: eventId });
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, stats: data };
    } catch (error) {
      return handleServiceError(error, 'Erro ao buscar estatísticas', { stats: {} });
    }
  },

  
  async joinPublicEvent(eventId) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_JOIN_EVENT), { eventId });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao participar do evento');
    }
  },

  
  async joinEventWithInvite(eventId, inviteToken) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_JOIN_WITH_INVITE, { token: inviteToken }), { 
        eventId, 
        inviteToken 
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso via convite' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento via convite' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao participar do evento via convite');
    }
  },

  
  async joinEventWithCode(eventId, eventCode) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_JOIN_WITH_CODE), { 
        eventId, 
        eventCode 
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso via código' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento via código' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao participar do evento via código');
    }
  },

  
  async removeParticipant(eventId, participantId) {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_REMOVE_FROM_EVENT, { eventId, participantId }), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participante removido com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao remover participante' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao remover participante');
    }
  },

  
  async confirmParticipant(eventId, participantId) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_CONFIRM_PARTICIPATION, { eventId, participantId }), {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar participação' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao confirmar participação');
    }
  },

  
  async promoteToCollaborator(eventId, participantId) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_PROMOTE, { eventId, participantId }), {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participante promovido a colaborador' };
      } else {
        return { success: false, message: data.message || 'Erro ao promover participante' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao promover participante');
    }
  },

  
  async demoteCollaborator(eventId, participantId) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_DEMOTE, { eventId, participantId }), {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Colaborador removido com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao remover colaborador' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao remover colaborador');
    }
  },

  
  async generateQrCode(eventId) {
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_QR_CODE, { eventId }));
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erro ao gerar QR Code' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao gerar QR Code');
    }
  },

  async leaveEvent(eventId) {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_LEAVE_EVENT), {
        eventId: eventId
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Você saiu do evento com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao sair do evento' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao sair do evento');
    }
  },
  
  async getAttendanceReport(eventId) {
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_ATTENDANCE_REPORT, { eventId }));
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erro ao obter relatório' };
      }
    } catch (error) {
      return handleServiceError(error, 'Erro ao obter relatório');
    }
  }
};

export default ParticipantService;
