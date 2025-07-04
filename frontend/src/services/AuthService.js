
import { post } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';

const AuthService = {
  
  async login(credentials) {
    try {
      
      if (!credentials.username || !credentials.password) {
        return { success: false, message: 'Username e senha são obrigatórios' };
      }

      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), credentials);
      const data = await response.json();
      
      if (data.success && data.data && data.data.token) {
        
        localStorage.setItem('token', data.data.token);
        
        const user = { username: credentials.username };
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user: user, token: data.data.token };
      } else {
        return { success: false, message: data.message || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Login error:', error);
      

      if (error.message.includes('404')) {
        return { success: false, message: 'Serviço de autenticação não encontrado' };
      } else if (error.message.includes('401')) {
        return { success: false, message: 'Username ou senha incorretos' };
      } else if (error.message.toLowerCase().includes('blocked') || 
                 error.message.toLowerCase().includes('bloqueada') || 
                 error.message.toLowerCase().includes('usuário bloqueado') ||
                 error.message.toLowerCase().includes('conta bloqueada')) {
        return { success: false, message: 'Sua conta foi Excluída. Entre em contato com o suporte para mais informações.' };
      } else if (error.message.includes('403')) {
        return { success: false, message: 'Sua conta foi Excluída. Entre em contato com o suporte para mais informações.' };
      } else if (error.message.includes('500')) {
        return { success: false, message: 'Erro interno do servidor. Tente novamente.' };
      } else if (error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
      }
      
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
  async register(userData) {
    try {
      
      const validation = this.validateRegisterData(userData);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.REGISTER), userData);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message || 'Usuário registrado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro no registro' };
      }    } catch (error) {
      console.error('Register error:', error);
      
      
      if (error.message && !error.message.includes('HTTP error!')) {
        return { success: false, message: error.message };
      }
      
      
      if (error.message.includes('400')) {
        return { success: false, message: 'Dados inválidos. Verifique os campos e tente novamente.' };
      } else if (error.message.includes('409')) {
        return { success: false, message: 'Username ou email já estão em uso' };
      } else if (error.message.includes('500')) {
        return { success: false, message: 'Erro interno do servidor. Tente novamente.' };
      } else if (error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
      }
      
      return { success: false, message: 'Erro inesperado. Tente novamente.' };
    }
  },
  
  validateRegisterData(userData) {
    if (!userData.name || userData.name.trim().length === 0) {
      return { isValid: false, message: 'Nome é obrigatório' };
    }
    
    if (!userData.username || userData.username.trim().length === 0) {
      return { isValid: false, message: 'Username é obrigatório' };
    }
    
    if (!userData.email || userData.email.trim().length === 0) {
      return { isValid: false, message: 'Email é obrigatório' };
    }
    
    if (!userData.password || userData.password.length === 0) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }
    
    return { isValid: true };
  },

  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  getToken() {
    return localStorage.getItem('token');
  },

  
  updateCurrentUser(updatedUserData) {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updatedUserData };
        
        // Nunca salva a foto no localStorage - sempre busca do backend
        // Isso evita QuotaExceededError e mantém os dados sincronizados
        const userWithoutPhoto = { ...updatedUser };
        delete userWithoutPhoto.photo;
        localStorage.setItem('user', JSON.stringify(userWithoutPhoto));
        
        // Retorna o usuário com foto para uso imediato na UI
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Usuário não encontrado no localStorage' };
    } catch (error) {
      console.error('Erro ao atualizar usuário no localStorage:', error);
      return { success: false, message: 'Erro ao atualizar dados do usuário' };
    }
  },

  
  async refreshUserData() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'Token não encontrado' };
      }

      
      
      
      
      
      const currentUser = this.getCurrentUser();
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
      return { success: false, message: 'Erro ao recarregar dados do usuário' };
    }
  }
};

export default AuthService;
