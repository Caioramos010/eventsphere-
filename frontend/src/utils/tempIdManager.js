export const generateTemporaryId = (event) => {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  
  
  if (event && event.name) {
    
    const cleanName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20); 
    
    return `temp_${cleanName}_${timestamp}_${randomPart}`;
  }
  
  
  return `temp_event_${timestamp}_${randomPart}`;
};


export const isTemporaryId = (id) => {
  return id && typeof id === 'string' && id.startsWith('temp_');
};


export const cacheEvents = (cacheKey, events) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(events));
  } catch (error) {
    console.error(`Erro ao salvar cache de eventos ${cacheKey}:`, error);
  }
};


export const getEventsFromCache = (cacheKey) => {
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error(`Erro ao recuperar cache de eventos ${cacheKey}:`, error);
  }
  return [];
};


export const findEventInCache = (eventId) => {
  if (!eventId) return null;
  
  try {
    
    const cacheKeys = ['myEventsCache', 'publicEventsCache'];
    
    for (const cacheKey of cacheKeys) {
      const events = getEventsFromCache(cacheKey);
      const event = events.find(e => e.id === eventId);
      if (event) {
        return event;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar evento ${eventId} nos caches:`, error);
  }
  
  return null;
};


export const updateEventId = (tempId, permanentId) => {
  if (!tempId || !permanentId) return;
  
  try {
    
    const cacheKeys = ['myEventsCache', 'publicEventsCache'];
    
    for (const cacheKey of cacheKeys) {
      const events = getEventsFromCache(cacheKey);
      const updated = events.map(e => {
        if (e.id === tempId) {
          return { ...e, id: permanentId, isTemporaryId: false };
        }
        return e;
      });
      
      cacheEvents(cacheKey, updated);
    }
  } catch (error) {
    console.error(`Erro ao atualizar ID do evento ${tempId}:`, error);
  }
};


const tempIdManager = {
  generateTemporaryId,
  isTemporaryId,
  cacheEvents,
  getEventsFromCache,
  findEventInCache,
  updateEventId
};

export default tempIdManager;
