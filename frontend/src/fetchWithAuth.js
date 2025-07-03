import API_CONFIG, { buildUrl } from './config/api';
import { handleServiceError } from './utils/errorHandler';


const validateToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token invalid');
    }

    return true;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};


const redirectToLogin = () => {
  const publicPaths = ['/login', '/register', '/'];
  const currentPath = window.location.pathname;
  
  if (!publicPaths.includes(currentPath)) {
    window.location.replace('/login');
  }
};


export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const isAuthEndpoint = url.includes('/login') || url.includes('/register');

  
  if (token && !isAuthEndpoint) {
    
    const shouldValidate = options.validateToken === true;
    if (shouldValidate) {
      const isValid = await validateToken();
      if (!isValid) {
        redirectToLogin();
        throw new Error('Token expired');
      }
    }
  }

  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers,
    timeout: options.timeout || API_CONFIG.TIMEOUT
  };

  try {
    const response = await fetch(url, config);

    
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectToLogin();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => null);
      const message = errorData?.message || `HTTP ${response.status}`;
      
      // Trata especificamente o status 409 (Conflict) para "participante já presente"
      if (response.status === 409 && message.includes('já está presente')) {
        const error = new Error(message);
        error.isParticipantAlreadyPresent = true;
        throw error;
      }
      
      throw new Error(message);
    }

    return response;
  } catch (error) {
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      if (window.location.pathname !== '/server-off') {
        window.location.href = '/server-off';
      }
    }

    throw error;
  }
}


export async function get(endpoint, params = {}) {
  const url = endpoint.startsWith('http') ? endpoint : buildUrl(endpoint, params);
  return fetchWithAuth(url, { method: 'GET' });
}

export async function post(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function put(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function del(endpoint) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, { method: 'DELETE' });
}

export async function uploadFile(endpoint, formData) {
  const token = localStorage.getItem('token');
  const url = buildUrl(endpoint);

  
  if (token) {
    const isValid = await validateToken();
    if (!isValid) {
      redirectToLogin();
      throw new Error('Token expired');
    }
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
    
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectToLogin();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => null);
      const message = errorData?.message || `Upload failed (${response.status})`;
      throw new Error(message);
    }

    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}


export const forceTokenValidation = validateToken;


if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const publicPaths = ['/login', '/register', '/'];
  
  if (token && !publicPaths.includes(window.location.pathname)) {
    validateToken().then(isValid => {
      if (!isValid) {
        redirectToLogin();
      }
    });
  }
}
