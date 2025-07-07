import React from 'react';
import StandardModal from './StandardModal';

const AppModal = ({ open, title, children, onClose, actions }) => {
  return (
    <StandardModal
      isOpen={open}
      onClose={onClose}
      title={title}
      variant="attendance"
      size="medium"
      actions={actions}
    >
      {children}
    </StandardModal>
  );
};

export default AppModal;
