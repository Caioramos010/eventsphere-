import React, { useState, useEffect } from 'react';
import AppModal from './AppModal';

const AppPrompt = ({ open, message, label = 'Confirmar', type = 'password', onSubmit, onCancel }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue('');
  }, [open]);

  if (!open) return null;

  return (
    <AppModal
      open={open}
      title="Confirmação de senha"
      onClose={onCancel}
      actions={[
        <button key="cancel" className="modern-btn" style={{ background: 'var(--color-danger)' }} onClick={onCancel}>
          Cancelar
        </button>,
        <button key="ok" className="modern-btn" style={{ background: 'var(--color-success)' }} onClick={() => onSubmit(value)}>
          {label}
        </button>
      ]}
    >
      <div style={{ textAlign: 'center', color: 'var(--color-text-white)', fontSize: 16, margin: '18px 0' }}>
        {message}
      </div>
      <input
        className="modern-input"
        type={type}
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ margin: '16px 0', width: '100%' }}
      />
    </AppModal>
  );
};

export default AppPrompt;
