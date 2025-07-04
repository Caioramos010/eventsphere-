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
    USER_PHOTO_REMOVE: '/api/user/remove-photo',
    USER_PHOTO_REMOVE: '/api/user/remove-photo',
    
    EVENT_CREATE: '/api/event/register',
    EVENT_EDIT: '/api/event/{eventID}',
    EVENT_GET: '/api/event/{eventID}',
    EVENT_DELETE: '/api/event/{eventID}',
    EVENT_IMAGE: '/api/upload/event-image',
    MY_EVENTS: '/api/event/my',
    ALL_MY_EVENTS: '/api/event/all-my',
    PUBLIC_EVENTS: '/api/event/public',
    EVENT_START: '/api/event/{eventID}/start',
    EVENT_FINISH: '/api/event/{eventID}/finish',      
    EVENT_CANCEL: '/api/event/{eventID}/cancel',    
    INVITE_GENERATE: '/api/event/{eventID}/invite',
    INVITE_VALIDATE: '/api/event/invite/{token}',
    EVENT_CODE_GENERATE: '/api/event/{eventID}/code',
    EVENT_CODE_VALIDATE: '/api/event/validate-code',
    USER_PHOTO: '/api/upload/user-photo',
    FILE_DOWNLOAD: '/api/files',
    
    PARTICIPANT_ADD: '/api/participant/add',
    PARTICIPANT_REMOVE: '/api/participant/remove',
    PARTICIPANT_LEAVE_EVENT: '/api/participant/leave-event',
    PARTICIPANT_CONFIRM: '/api/participant/confirm',
    PARTICIPANT_JOIN_WITH_INVITE: '/api/event/join/{token}',
    PARTICIPANT_INVITE: '/api/participant/invite',
    PARTICIPANT_STATUS_UPDATE: '/api/participant/status/{participantId}',
    PARTICIPANT_JOIN_EVENT: '/api/participant/join-event',
    PARTICIPANT_JOIN_WITH_CODE: '/api/participant/join-with-code',
    PARTICIPANT_REMOVE_FROM_EVENT: '/api/participant/remove/{eventId}/{participantId}',
    PARTICIPANT_CONFIRM_PARTICIPATION: '/api/participant/confirm/{eventId}/{participantId}',
    PARTICIPANT_PROMOTE: '/api/participant/promote/{eventId}/{participantId}',
    PARTICIPANT_DEMOTE: '/api/participant/demote/{eventId}/{participantId}',
    PARTICIPANT_QR_CODE: '/api/participant/qr-code/{eventId}',
    PARTICIPANT_ATTENDANCE_REPORT: '/api/participant/attendance-report/{eventId}',
    PARTICIPANT_EVENT_PRESENT: '/api/participant/present/{eventId}',
    PARTICIPANT_PRESENCE: '/api/participant/presence/{token}',
    
    ADMIN: '/admin'
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  TIMEOUT: 30000
};

export default API_CONFIG;

export const buildUrl = (endpoint, params = {}) => {
  if (!endpoint) {
    console.error('Endpoint is undefined or null');
    throw new Error('Endpoint não pode ser undefined ou null');
  }
  
  if (endpoint.startsWith('http')) {
    if (Object.keys(params).length > 0) {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
      return url.toString();
    }
    
    return endpoint;
  }
  
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  Object.keys(params).forEach(key => {
    const placeholder = `{${key}}`;
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, params[key]);
      delete params[key]; 
    }
  });
  
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  if ([...queryParams].length > 0) {
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

export const buildUrlWithId = (endpoint, id) => {
  return `${API_CONFIG.BASE_URL}${endpoint}/${id}`;
};
