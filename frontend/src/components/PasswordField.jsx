import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import '../styles/shared.css';


const PasswordField = ({
  label = 'SENHA',
  name,
  value,
  onChange,
  placeholder = 'Digite sua senha',
  required = false,
  disabled = false,
  error = '',
  hint = '',
  showRequirements = false,
  className = '',
  autoComplete = 'current-password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const fieldId = `field-${name}`;
  const hasError = Boolean(error);
  const fieldClasses = `form-field password-field ${hasError ? 'error' : ''} ${className}`;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  
  const requirements = showRequirements ? {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
  } : null;

  const defaultHint = showRequirements 
    ? "Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&)"
    : hint;

  return (
    <div className={fieldClasses}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          id={fieldId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input password-input ${hasError ? 'has-error' : ''}`}
          autoComplete={autoComplete}
          {...props}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          tabIndex={0}
          aria-label="Mostrar/ocultar senha"
          disabled={disabled}
        >
          {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
      {showRequirements && value && !error && (
        <div className="password-requirements">
          <div className={`requirement ${requirements.length ? 'met' : 'unmet'}`}>
            {requirements.length ? '✓' : '○'} Mínimo 8 caracteres
          </div>
          <div className={`requirement ${requirements.uppercase ? 'met' : 'unmet'}`}>
            {requirements.uppercase ? '✓' : '○'} Letra maiúscula
          </div>
          <div className={`requirement ${requirements.lowercase ? 'met' : 'unmet'}`}>
            {requirements.lowercase ? '✓' : '○'} Letra minúscula
          </div>
          <div className={`requirement ${requirements.number ? 'met' : 'unmet'}`}>
            {requirements.number ? '✓' : '○'} Pelo menos um número
          </div>
          <div className={`requirement ${requirements.special ? 'met' : 'unmet'}`}>
            {requirements.special ? '✓' : '○'} Caracteres especiais
          </div>
        </div>
      )}
      {(defaultHint && !error && (!showRequirements || !value)) && (
        <span className="field-hint">{defaultHint}</span>
      )}
    </div>
  );
};

PasswordField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hint: PropTypes.string,
  showRequirements: PropTypes.bool,
  className: PropTypes.string,
  autoComplete: PropTypes.string
};

export default PasswordField;
