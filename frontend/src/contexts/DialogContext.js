import React, { useState, useCallback, useContext, createContext } from 'react';
import AppAlert from '../components/AppAlert';
import AppConfirm from '../components/AppConfirm';
import AppPrompt from '../components/AppPrompt';

const DialogContext = createContext();

export function useDialog() {
  return useContext(DialogContext);
}

export function DialogProvider({ children }) {
  const [alertState, setAlertState] = useState({ open: false, message: '', resolve: null });
  const [confirmState, setConfirmState] = useState({ open: false, message: '', resolve: null });
  const [promptState, setPromptState] = useState({ open: false, message: '', resolve: null, type: 'text', label: '' });

  const alert = useCallback((message) => {
    return new Promise((resolve) => {
      setAlertState({ open: true, message, resolve });
    });
  }, []);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, message, resolve });
    });
  }, []);

  const prompt = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setPromptState({ open: true, message, resolve, ...options });
    });
  }, []);

  const handleAlertClose = () => {
    setAlertState((prev) => {
      prev.resolve && prev.resolve();
      return { ...prev, open: false };
    });
  };

  const handleConfirm = (result) => {
    setConfirmState((prev) => {
      prev.resolve && prev.resolve(result);
      return { ...prev, open: false };
    });
  };

  const handlePromptSubmit = (value) => {
    setPromptState((prev) => {
      prev.resolve && prev.resolve(value);
      return { ...prev, open: false };
    });
  };
  const handlePromptCancel = () => {
    setPromptState((prev) => {
      prev.resolve && prev.resolve(null);
      return { ...prev, open: false };
    });
  };

  return (
    <DialogContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      <AppAlert open={alertState.open} message={alertState.message} onClose={handleAlertClose} />
      <AppConfirm
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={() => handleConfirm(true)}
        onCancel={() => handleConfirm(false)}
      />
      <AppPrompt
        open={promptState.open}
        message={promptState.message}
        label={promptState.label}
        type={promptState.type}
        onSubmit={handlePromptSubmit}
        onCancel={handlePromptCancel}
      />
    </DialogContext.Provider>
  );
}
