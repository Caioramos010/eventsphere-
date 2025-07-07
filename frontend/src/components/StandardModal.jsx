import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';
import '../styles/StandardModal.css';

const StandardModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  showHeader = true,
  actions,
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  maxHeight = '90vh',
  customStyles = {},
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'standard-modal-small',
    medium: 'standard-modal-medium',
    large: 'standard-modal-large',
    fullscreen: 'standard-modal-fullscreen'
  };

  const variantClasses = {
    default: 'standard-modal-default',
    glass: 'standard-modal-glass',
    image: 'standard-modal-image',
    participant: 'standard-modal-participant',
    qr: 'standard-modal-qr',
    attendance: 'standard-modal-attendance'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    // Trap focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const modalContent = (
    <div 
      className="standard-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "standard-modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`standard-modal ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{ maxHeight, ...customStyles }}
        {...props}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <div className="standard-modal-header">
            {title && (
              <h3 id="standard-modal-title" className="standard-modal-title">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                className="standard-modal-close"
                onClick={onClose}
                aria-label="Fechar modal"
                type="button"
              >
                <IoCloseOutline />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="standard-modal-body">
          {children}
        </div>

        {/* Actions/Footer */}
        {actions && (
          <div className="standard-modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

StandardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  variant: PropTypes.oneOf(['default', 'glass', 'image', 'participant', 'qr', 'attendance']),
  showCloseButton: PropTypes.bool,
  showHeader: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  maxHeight: PropTypes.string,
  customStyles: PropTypes.object
};

export default StandardModal;
