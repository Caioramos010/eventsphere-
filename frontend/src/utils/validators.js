import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants';

export const validateEvent = (event) => {
  const errors = [];
  
  if (!event) {
    errors.push('Evento é obrigatório');
    return { isValid: false, errors };
  }
  
  if (!event.name || event.name.trim().length < VALIDATION_RULES.MIN_EVENT_NAME_LENGTH) {
    errors.push(`Nome deve ter pelo menos ${VALIDATION_RULES.MIN_EVENT_NAME_LENGTH} caracteres`);
  }
  
  if (event.name && event.name.length > VALIDATION_RULES.MAX_EVENT_NAME_LENGTH) {
    errors.push(`Nome deve ter no máximo ${VALIDATION_RULES.MAX_EVENT_NAME_LENGTH} caracteres`);
  }
  
  if (event.description && event.description.length > VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Descrição deve ter no máximo ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} caracteres`);
  }
  
  if (event.dateFixedStart) {
    const startDate = new Date(event.dateFixedStart + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      errors.push('Data de início não pode ser no passado');
    }
  }
  
  if (event.dateFixedStart && event.dateFixedEnd) {
    const startDate = new Date(event.dateFixedStart);
    const endDate = new Date(event.dateFixedEnd);
    
    if (endDate < startDate) {
      errors.push('Data de fim deve ser posterior à data de início');
    }
  }
  
  if (event.maxParticipants && (event.maxParticipants < 1 || event.maxParticipants > 10000)) {
    errors.push('Número máximo de participantes deve estar entre 1 e 10.000');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUser = (user) => {
  const errors = [];
  
  if (!user) {
    errors.push('Dados do usuário são obrigatórios');
    return { isValid: false, errors };
  }
  
  if (!user.username || user.username.trim().length < VALIDATION_RULES.MIN_USERNAME_LENGTH) {
    errors.push(`Username deve ter pelo menos ${VALIDATION_RULES.MIN_USERNAME_LENGTH} caracteres`);
  }
  
  if (user.username && user.username.length > VALIDATION_RULES.MAX_USERNAME_LENGTH) {
    errors.push(`Username deve ter no máximo ${VALIDATION_RULES.MAX_USERNAME_LENGTH} caracteres`);
  }
  
  if (user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      errors.push('Email inválido');
    }
  }
  
  if (user.password && user.password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} caracteres`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeEventData = (events) => {
  if (!Array.isArray(events)) {
    return [];
  }
  
  return events
    .filter(event => {
      const validation = validateEvent(event);
      if (!validation.isValid) {
        console.warn('Evento inválido filtrado:', validation.errors);
        return false;
      }
      return true;
    })
    .map(event => ({
      ...event,
      id: event.id || `temp_${Date.now()}_${Math.random()}`,
      name: event.name?.trim(),
      description: event.description?.trim(),
      maxParticipants: event.maxParticipants || VALIDATION_RULES.MAX_PARTICIPANTS
    }));
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    return { isValid: true, errors }; // File is optional
  }
  
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de arquivo não suportado. Use: JPEG, PNG, GIF ou WebP');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateQRCode = (qrData) => {
  const errors = [];
  
  if (!qrData || typeof qrData !== 'string') {
    errors.push('QR Code inválido');
    return { isValid: false, errors };
  }
  
  const trimmedData = qrData.trim();
  
  if (!/^\d{6}$/.test(trimmedData)) {
    errors.push('QR Code deve conter exatamente 6 dígitos');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: trimmedData
  };
};

export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return errors.join('; ');
};

export const validateRequired = (message = 'Campo obrigatório') => {
  return (value) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return message;
    }
    return null;
  };
};

export const validateEmail = (message = 'Email inválido') => {
  return (value) => {
    if (!value) return null;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  };
};

export const validatePassword = (minLength = 8, message = null) => {
  return (value) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return null;
    }
    
    if (value.length < minLength) {
      return message || `Senha deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  };
};

export const validateStrongPassword = (message = null) => {
  return (value) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return null; // Let validateRequired handle empty values
    }
    
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    if (!hasMinLength) {
      return 'Senha deve ter pelo menos 8 caracteres';
    }
    
    if (!hasUppercase) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }
    
    if (!hasLowercase) {
      return 'Senha deve conter pelo menos uma letra minúscula';
    }
    
    if (!hasNumber) {
      return 'Senha deve conter pelo menos um número';
    }
    
    if (!hasSpecialChar) {
      return 'Senha deve conter pelo menos um caractere especial';
    }
    
    return null;
  };
};

export const validateMinLength = (minLength, message = null) => {
  return (value) => {
    if (!value) return null; // Optional field
    
    if (value.length < minLength) {
      return message || `Deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  };
};

export const validateMaxLength = (maxLength, message = null) => {
  return (value) => {
    if (!value) return null; // Optional field
    
    if (value.length > maxLength) {
      return message || `Deve ter no máximo ${maxLength} caracteres`;
    }
    return null;
  };
};

export const validateOnlyLetters = (message = 'Nome deve conter apenas letras e espaços') => {
  return (value) => {
    if (!value) return null;
    
    const lettersRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    
    if (!lettersRegex.test(value)) {
      return message;
    }
    
    if (/\s{2,}/.test(value)) {
      return 'Nome não pode conter espaços consecutivos';
    }
    
    if (value.trim() !== value) {
      return 'Nome não pode começar ou terminar com espaço';
    }
    
    return null;
  };
};

// Alias for backward compatibility
export const validateEventData = validateEvent;
