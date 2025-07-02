import React from 'react';
import AppModal from './AppModal';

const AppConfirm = ({ open, message, onConfirm, onCancel }) => (
  <AppModal
    open={open}
    title="Confirmação"
    onClose={onCancel}
    actions={[
      <button key="cancel" className="modern-btn" style={{ background: 'var(--color-danger)' }} onClick={onCancel}>
        Cancelar
      </button>,
      <button key="ok" className="modern-btn" style={{ background: 'var(--color-success)' }} onClick={onConfirm}>
        Confirmar
      </button>
    ]}
  >
    <div style={{ textAlign: 'center', color: 'var(--color-text-white)', fontSize: 16, margin: '18px 0' }}>
      {message}
    </div>
  </AppModal>
);

export default AppConfirm;
