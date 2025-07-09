export const DEFAULTS = {
  MAX_PARTICIPANTS: 50,
  MESSAGE_TIMEOUT: 3000,
  RETRY_ATTEMPTS: 3,
  CACHE_EXPIRY: 5 * 60 * 1000, 
  PHOTO_MAX_SIZE: 10 * 1024 * 1024,
  QR_SCAN_INTERVAL: 500,
  TOKEN_CHECK_INTERVAL: 60000
};

export const DEFAULT_VALUES = {
  EVENT: {
    MAX_PARTICIPANTS: 50,
    DEFAULT_CLASSIFICATION: 18,
    DEFAULT_ACCESS: 'PUBLIC'
  }
};

export const VALIDATION_RULES = {
  MIN_EVENT_NAME_LENGTH: 3,
  MAX_EVENT_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PARTICIPANTS: 10000
};

export const EVENT_STATES = {
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE', 
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED'
};

export const PARTICIPANT_STATUS = {
  INVITED: 'INVITED',
  CONFIRMED: 'CONFIRMED',
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  CANCELED: 'CANCELED'
};

export const ACCESS_TYPES = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EVENTS: '/events',
  CREATE_EVENT: '/create-event',
  PROFILE: '/profile',
  QR_SCANNER: '/qr-scanner'
};

export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  SERVER: 'SERVER',
  NOT_FOUND: 'NOT_FOUND'
};

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Evento criado com sucesso!',
  EVENT_UPDATED: 'Evento atualizado com sucesso!',
  EVENT_DELETED: 'Evento excluído com sucesso!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  INVITE_SENT: 'Convite enviado com sucesso!',
  ATTENDANCE_CONFIRMED: 'Presença confirmada!',
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  REGISTER_SUCCESS: 'Conta criada com sucesso!'
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',
  PERMISSION_DENIED: 'Você não tem permissão para esta operação',
  EVENT_NOT_FOUND: 'Evento não encontrado',
  USER_NOT_FOUND: 'Usuário não encontrado',
  NOT_FOUND: 'Recurso não encontrado',
  CONFLICT: 'Conflito: o recurso já existe',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  SERVER_ERROR: 'Erro interno do servidor',
  VALIDATION_ERROR: 'Dados inválidos fornecidos',
  FILE_TOO_LARGE: 'Arquivo muito grande. Máximo permitido: 10MB',
  CAMERA_ERROR: 'Erro ao acessar câmera',
  QR_INVALID: 'QR Code inválido'
};

export const CAMERA_CONSTRAINTS = {
  VIDEO: {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30 }
  }
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  EVENTS_CACHE: 'events_cache',
  PUBLIC_EVENTS_CACHE: 'public_events_cache',
  LAST_TOKEN_CHECK: 'last_token_check'
};
