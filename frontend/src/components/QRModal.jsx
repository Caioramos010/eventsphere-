import React from 'react';
import StandardModal from './StandardModal';
import PropTypes from 'prop-types';

const QRModal = ({ 
  isOpen, 
  onClose, 
  qrCodeData,
  eventName,
  onCopyCode,
  className = ''
}) => {
  if (!isOpen || !qrCodeData) return null;

  const handleCopyCode = async () => {
    if (qrCodeData.qrCodeText && onCopyCode) {
      await navigator.clipboard.writeText(qrCodeData.qrCodeText);
      onCopyCode('Código copiado para a área de transferência!');
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Seu QR Code de Presença"
      variant="qr"
      size="small"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      className={className}
    >
      <div style={{ textAlign: 'center' }}>
        {eventName && (
          <div style={{
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--color-text-white)'
          }}>
            <strong>Evento:</strong> {eventName}
          </div>
        )}
        
        {qrCodeData.qrCodeImage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <img 
              src={`data:image/png;base64,${qrCodeData.qrCodeImage}`} 
              alt="QR Code de Presença" 
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                border: '2px solid var(--color-primary)',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
        
        <p style={{
          margin: '16px 0',
          fontSize: '14px',
          color: 'var(--color-text-light)',
          lineHeight: 1.4
        }}>
          Mostre este código para o organizador marcar sua presença
        </p>
        
        {qrCodeData.qrCodeText && (
          <div style={{
            marginTop: '16px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <small style={{ color: 'var(--color-text-light)' }}>
              Código: {qrCodeData.qrCodeText}
            </small>
            <button
              onClick={handleCopyCode}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title="Copiar código"
            >
              Copiar
            </button>
          </div>
        )}
      </div>
    </StandardModal>
  );
};

QRModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  qrCodeData: PropTypes.shape({
    qrCodeImage: PropTypes.string,
    qrCodeText: PropTypes.string
  }).isRequired,
  eventName: PropTypes.string,
  onCopyCode: PropTypes.func,
  className: PropTypes.string
};

export default QRModal;
