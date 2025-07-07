import React from 'react';
import StandardModal from './StandardModal';
import PropTypes from 'prop-types';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title, 
  description,
  className = ''
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      variant="image"
      size="large"
      showHeader={false}
      closeOnOverlayClick={true}
      closeOnEscape={true}
      className={className}
    >
      <img 
        src={imageUrl}
        alt={title || 'Imagem'}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '80vh',
          objectFit: 'contain',
          display: 'block'
        }}
      />
      {(title || description) && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          color: 'white',
          padding: '40px 24px 24px',
          textAlign: 'center'
        }}>
          {title && (
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.4rem',
              fontWeight: 600
            }}>
              {title}
            </h3>
          )}
          {description && (
            <p style={{
              margin: 0,
              opacity: 0.8,
              fontSize: '0.9rem'
            }}>
              {description}
            </p>
          )}
        </div>
      )}
    </StandardModal>
  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string
};

export default ImageModal;
