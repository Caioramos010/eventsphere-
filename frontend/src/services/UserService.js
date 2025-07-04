import { get, put, uploadFile, fetchWithAuth } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';
import AuthService from './AuthService';
import { handleServiceError } from '../utils/errorHandler';


const buildUrlWithId = (baseUrl, id) => {
  return `${baseUrl}/${id}`;
};

const UserService = {  
  async updateEmail(newEmail) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE_EMAIL, { newEmail }));
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Após atualizar o email, busca os dados atualizados do usuário
        const profileResult = await this.fetchCurrentUserProfileAndSync();
        if (profileResult.success) {
          return { success: true, message: data.message || 'Email atualizado com sucesso' };
        }
        return { success: false, message: 'Erro ao sincronizar perfil após atualização' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar email' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.updateEmail');
    }
  },
  
  async updateUsername(newUsername) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE_USERNAME, { newUsername }));
      const data = await response.json();
      
      if (data.success || response.ok) {
        AuthService.logout();
        return { success: true, message: data.message || 'Login atualizado com sucesso. Faça login novamente.' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar login' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.updateUsername');
    }
  },

  
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await put(buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE_PASSWORD, { currentPassword, newPassword }));
      const data = await response.json();
      
      if (data.success || response.ok) {
        AuthService.logout();
        return { success: true, message: data.message || 'Senha atualizada com sucesso. Faça login novamente.' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar senha' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.updatePassword');
    }
  },  
  async uploadUserPhoto(imageFile) {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);
      const response = await uploadFile(buildUrl(API_CONFIG.ENDPOINTS.USER_PHOTO), formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        const photoBase64 = data.data?.photoBase64 || data.photoBase64;
        AuthService.updateCurrentUser({ photo: photoBase64 });
        
        return { 
          success: true, 
          photoUrl: photoBase64, 
          photoBase64: photoBase64 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao fazer upload da foto' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.uploadUserPhoto');
    }
  },

  
  async getUserById(userId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USERS, { userId });
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, user: data };
    } catch (error) {
      return handleServiceError(error, 'UserService.getUserById');
    }
  },

  
  async searchUsers(query) {
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.USERS, { search: query }));
      const data = await response.json();
      return { success: true, users: data };
    } catch (error) {
      return handleServiceError(error, 'UserService.searchUsers', { users: [] });
    }
  },

  
  async changePassword(passwordData) {
    try {
      const response = await put(buildUrl(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/password`), passwordData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Senha alterada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao alterar senha' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.changePassword');
    }
  },

  
  async deleteAccount(password) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USER_DELETE, { password });

      const response = await fetchWithAuth(url, {
        method: 'DELETE',
      });
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }
      if ((data && (data.success || response.ok)) || response.status === 204) {
        AuthService.logout();
        return { success: true, message: (data && data.message) || 'Conta deletada com sucesso' };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: (data && data.message) || 'Acesso negado. Faça login novamente.' };
      } else {
        return { success: false, message: (data && data.message) || 'Erro ao deletar conta' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.deleteAccount');
    }
  },

  /**
   * Busca o perfil do usuário autenticado e atualiza o AuthService/localStorage,
   * garantindo que o campo da foto seja persistido na sessão.
   */
  async fetchCurrentUserProfileAndSync() {
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.USER_PROFILE));
      const data = await response.json();
      const userData = data.data || data;
      if (userData && (data.success === undefined || data.success === true)) {
        AuthService.updateCurrentUser({
          username: userData.username,
          email: userData.email,
          photo: userData.photo || userData.photoBase64 || '',
          id: userData.id,
          name: userData.name,
        });
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Erro ao buscar perfil do usuário' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.fetchCurrentUserProfileAndSync');
    }
  },

  /**
   * Busca o perfil do usuário atual de forma simples
   */
  async getUserProfile() {
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.USER_PROFILE));
      const data = await response.json();
      const userData = data.data || data;
      
      if (userData && (data.success === undefined || data.success === true)) {
        return userData;
      } else {
        throw new Error(data.message || 'Erro ao buscar perfil do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      throw error;
    }
  },

  async removeUserPhoto() {
    try {
      const response = await fetchWithAuth(buildUrl(API_CONFIG.ENDPOINTS.USER_PHOTO_REMOVE), {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          AuthService.updateCurrentUser({ ...currentUser, photo: null });
        }
        
        return { 
          success: true, 
          message: data.message || 'Foto removida com sucesso'
        };
      } else {
        return { success: false, message: data.message || 'Erro ao remover foto' };
      }
    } catch (error) {
      return handleServiceError(error, 'UserService.removeUserPhoto');
    }
  },
};

export default UserService;
