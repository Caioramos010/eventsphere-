import React from 'react';
import AppModal from './AppModal';

const AppAlert = ({ open, message, onClose }) => (
  <AppModal open={open} title="Aviso" onClose={onClose}>
    <div style={{ textAlign: 'center', color: 'var(--color-text-white)', fontSize: 16, margin: '18px 0' }}>
      {message}
    </div>
    <button className="modern-btn" style={{ width: '100%' }} onClick={onClose}>
      OK
    </button>
  </AppModal>
);

export default AppAlert;
