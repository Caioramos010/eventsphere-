import { useState, useCallback, useMemo } from 'react';

export const useFormState = (initialState = {}, validators = {}) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const updateField = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const updateForm = useCallback((updates) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialState);
    setErrors({});
    resetMessages();
  }, [initialState]);

  const resetMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const showError = useCallback((message) => {
    setError(message);
    setSuccess('');
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setError('');
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(fieldName => {
      const fieldValidators = validators[fieldName];
      const fieldValue = form[fieldName];

      if (Array.isArray(fieldValidators)) {
        for (let validator of fieldValidators) {
          const errorMessage = validator(fieldValue);
          if (errorMessage) {
            newErrors[fieldName] = errorMessage;
            isValid = false;
            break; 
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [form, validators]);

  const handleChange = useCallback((e) => {
    const { name, value, type, files, checked } = e.target;
    
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files[0];
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    
    updateField(name, newValue);
  }, [updateField]);

  const handleSubmit = useCallback(async (submitFn) => {
    setLoading(true);
    resetMessages();
    
    try {
      const result = await submitFn(form);
      
      if (result.success) {
        showSuccess(result.message || 'Operação realizada com sucesso!');
        return result;
      } else {
        showError(result.message || 'Erro na operação');
        return result;
      }
    } catch (err) {
      showError(err.message || 'Erro inesperado');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [form, resetMessages, showError, showSuccess]);

  
  const isValidValue = useMemo(() => {
    if (!validators || Object.keys(validators).length === 0) {
      return true;
    }

    return Object.keys(validators).every(fieldName => {
      const fieldValidators = validators[fieldName];
      const fieldValue = form[fieldName];

      if (Array.isArray(fieldValidators)) {
        for (let validator of fieldValidators) {
          const errorMessage = validator(fieldValue);
          if (errorMessage) {
            return false;
          }
        }
      }
      return true;
    });
  }, [form, validators]);

  return {
    
    form,
    setForm,
    updateField,
    updateForm,
    resetForm,
    handleChange,
    
    
    values: form,
    errors,
    validate,
    isValid: isValidValue,
    
    
    loading,
    setLoading,
    
    
    error,
    success,
    showError,
    showSuccess,
    resetMessages,
    
    
    handleSubmit,
    
    
    setFormError: showError,
    setFormSuccess: showSuccess,
    setFormLoading: setLoading,
    formData: form,
    validateRequired: (message) => (value) => {
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return message;
      }
      return null;
    }
  };
};

export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    setError('');

    if (selectedFile) {
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Tipo de arquivo não suportado. Use JPEG, PNG ou GIF.');
        return;
      }

      
      const maxSize = 5 * 1024 * 1024; 
      if (selectedFile.size > maxSize) {
        setError('Arquivo muito grande. Tamanho máximo: 5MB.');
        return;
      }

      setFile(selectedFile);

      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError('');
  }, []);

  const resetUpload = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setError('');
  }, []);

  return {
    file,
    preview,
    uploading,
    error,
    setUploading,
    setPreview,
    handleFileChange,
    clearFile,
    resetUpload
  };
};
