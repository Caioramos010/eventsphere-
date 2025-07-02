import React from 'react';
import PropTypes from 'prop-types';
import { IoCamera, IoTrash } from 'react-icons/io5';
import Button from './Button';
import '../styles/ImageUpload.css';

const ImageUpload = ({
  preview,
  hasFile,
  loading,
  onFileChange,
  onRemove,
  onUpload,
  fileInputRef,
  accept = "image/*",
  placeholder = "Adicionar imagem",
  className = "",
  showUploadButton = true,
  uploadButtonText = "Fazer Upload",
  size = "medium"
}) => {
  const sizeClasses = {
    small: 'image-upload-small',
    medium: 'image-upload-medium',
    large: 'image-upload-large'
  };

  return (
    <div className={`image-upload ${sizeClasses[size]} ${className}`}>
      <div className="image-upload-container">
        {preview ? (
          <div className="image-upload-preview">
            <img src={preview} alt="Preview" className="image-upload-img" />
            <button 
              type="button" 
              className="image-upload-remove"
              onClick={onRemove}
              disabled={loading}
              aria-label="Remover imagem"
            >
              <IoTrash size={14} />
            </button>
          </div>
        ) : (
          <label className="image-upload-placeholder" htmlFor="image-upload-input">
            <IoCamera size={size === 'small' ? 20 : size === 'large' ? 40 : 30} />
            <p>{placeholder}</p>
          </label>
        )}
        
        <input
          id="image-upload-input"
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="image-upload-input"
          disabled={loading}
        />
      </div>
      
      {showUploadButton && hasFile && (
        <div className="image-upload-actions">
          <Button
            variant="primary"
            size="small"
            onClick={onUpload}
            loading={loading}
            disabled={loading || !hasFile}
          >
            {uploadButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  preview: PropTypes.string,
  hasFile: PropTypes.bool,
  loading: PropTypes.bool,
  onFileChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpload: PropTypes.func,
  fileInputRef: PropTypes.object,
  accept: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  showUploadButton: PropTypes.bool,
  uploadButtonText: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default ImageUpload;
