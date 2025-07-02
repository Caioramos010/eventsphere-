import React from 'react';
import '../styles/EventDetails.css';

const AppModal = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;
  return (
    <div className="attendance-modal-overlay">
      <div className="attendance-modal-container">
        <div className="attendance-modal-header">
          <h3>{title}</h3>
          <button className="attendance-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="attendance-modal-content">
          {children}
          {actions && (
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
