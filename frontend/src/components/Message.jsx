import React from 'react';
import PropTypes from 'prop-types';
import '../styles/shared.css';

/**
 * Message Component
 * Displays success, error, warning, or info messages
 */
const Message = ({ 
  type = 'info', 
  message, 
  onClose = null, 
  autoHide = false, 
  duration = 5000,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  if (!isVisible || !message) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`message ${type} ${className}`}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={handleClose}
          className="btn-close"
          aria-label="Fechar mensagem"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'inherit'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  autoHide: PropTypes.bool,
  duration: PropTypes.number,
  className: PropTypes.string
};

export default Message;
