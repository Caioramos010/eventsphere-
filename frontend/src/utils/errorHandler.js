import { ERROR_MESSAGES } from '../constants';

const HTTP_ERROR_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'SESSION_EXPIRED',
  403: 'PERMISSION_DENIED',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  500: 'SERVER_ERROR'
};

export const handleServiceError = (error, context = '') => {
  // Não loga erro no console se for um caso de participante já presente
  if (!(error.isParticipantAlreadyPresent || (error.message && error.message.includes('já está presente')))) {
    console.error(`Error in ${context}:`, error);
  }
  
  let message = 'Erro inesperado';
  let shouldRedirect = false;
  
  if (error.response) {
    const status = error.response.status;
    const errorKey = HTTP_ERROR_CODES[status];
    message = errorKey ? ERROR_MESSAGES[errorKey] : ERROR_MESSAGES.SERVER_ERROR;
    shouldRedirect = status === 401;
  } else if (error.message) {
    if (error.message.includes('Failed to fetch')) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      message = ERROR_MESSAGES.NETWORK_ERROR; // Use network error for timeout
    } else {
      message = error.message;
    }
  }
  
  if (shouldRedirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }, 1000);
  }
  
  return {
    success: false,
    message,
    shouldRedirect,
    originalError: error
  };
};

export const validateResponse = (response) => {
  if (!response) {
    throw new Error('Resposta vazia do servidor');
  }
  
  if (response.success === false) {
    throw new Error(response.message || 'Operação falhou');
  }
  
  return response;
};

export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return validateResponse(result);
    } catch (error) {
      return handleServiceError(error, context);
    }
  };
};
