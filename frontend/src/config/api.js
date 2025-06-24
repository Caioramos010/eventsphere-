const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
    LOGIN: '/login/accept',
    REGISTER: '/register/accept',
    USER_UPDATE_EMAIL: '/api/user/update-email',
    USER_UPDATE_USERNAME: '/api/user/update-username',
    USER_UPDATE_PASSWORD: '/api/user/update-passowrd',
    USER_DELETE: '/api/user/delete',
    USER_PROFILE: '/api/user/get',
    
    EVENT_CREATE: '/api/event/register',
    EVENT_EDIT: '/api/event/edit',
    EVENT_GET: '/api/event/get',
    EVENT_DELETE: '/api/event/delete',
    EVENT_IMAGE: '/api/upload/event-image',
    MY_EVENTS: '/api/event/get-myevents',
    PUBLIC_EVENTS: '/api/event/get-public',
    EVENT_START: '/api/event/start',
    EVENT_FINISH: '/api/event/finish',      
    EVENT_CANCEL: '/api/event/cancel',    
    INVITE_GENERATE: '/api/event/invite/generate',
    INVITE_VALIDATE: '/api/event/invite/validate',
    EVENT_CODE_GENERATE: '/api/event/code/generate',
    EVENT_CODE_VALIDATE: '/api/event/code/validate',
    USER_PHOTO: '/api/upload/user-photo',
    FILE_DOWNLOAD: '/api/files',
    
    PARTICIPANT_ADD: '/api/participant/add',
    PARTICIPANT_REMOVE: '/api/participant/remove',
    
    ADMIN: '/admin',
    NEXT_EVENTS: '/api/event/next-events',
    NEXT_PUBLIC_EVENTS: '/api/event/next-public-events'
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  TIMEOUT: 30000
};

export default API_CONFIG;

export const buildUrl = (endpoint, params = {}) => {
  if (endpoint.startsWith('http')) {
    console.log('URL já completa detectada:', endpoint);
    if (Object.keys(params).length > 0) {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
      console.log('URL com parâmetros:', url.toString());
      return url.toString();
    }
    
    return endpoint;
  }
  
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('Building URL from:', API_CONFIG.BASE_URL, endpoint);
  
  // Adicionar parâmetros de query se fornecidos
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  console.log('Final URL:', url);
  return url;
};

export const buildUrlWithId = (endpoint, id) => {
  return `${API_CONFIG.BASE_URL}${endpoint}/${id}`;
};
