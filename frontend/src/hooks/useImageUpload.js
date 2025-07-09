import { useState, useRef, useCallback } from 'react';

export const useImageUpload = (maxSize = 5 * 1024 * 1024, onSuccess, onError) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    
    if (!selectedFile.type.startsWith('image/')) {
      onError?.('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    
    if (selectedFile.size > maxSize) {
      onError?.(`A imagem deve ter no máximo ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setFile(selectedFile);

    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);

    
    onError?.('');
  }, [maxSize, onError]);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const uploadFile = useCallback(async (uploadFunction) => {
    if (!file) {
      onError?.('Selecione um arquivo para fazer o upload');
      return false;
    }

    setLoading(true);
    
    try {
      const result = await uploadFunction(file);
      
      if (result.success) {
        onSuccess?.(result);
        removeFile();
        return true;
      } else {
        onError?.(result.message || 'Erro ao fazer upload');
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Erro ao conectar com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [file, onSuccess, onError, removeFile]);

  const reset = useCallback(() => {
    removeFile();
    setLoading(false);
  }, [removeFile]);

  return {
    file,
    preview,
    loading,
    fileInputRef,
    handleFileChange,
    removeFile,
    uploadFile,
    reset,
    hasFile: !!file
  };
};
