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


const tempIdManager = {
  generateTemporaryId,
  isTemporaryId
};

export default tempIdManager;
