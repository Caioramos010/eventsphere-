import React from 'react';
import PropTypes from 'prop-types';
import '../styles/shared.css';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  hint = '',
  className = '',
  options = [], 
  rows = 4, 
  accept = '', 
  min,
  max,
  step,
  autoComplete = 'off',
  ...props
}) => {
  const fieldId = `field-${name}`;
  const hasError = Boolean(error);
  const fieldClasses = `form-field ${hasError ? 'error' : ''} ${className}`;

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value: type === 'file' ? undefined : value,
      onChange,
      placeholder,
      required,
      disabled,
      className: `form-input ${hasError ? 'has-error' : ''}`,
      autoComplete,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            accept={accept}
            value={undefined}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
          />
        );

      case 'checkbox':
        return (
          <div className="checkbox-wrapper">
            <input
              {...commonProps}
              type="checkbox"
              checked={value}
              className="form-checkbox"
            />
            <span className="checkbox-label">{label}</span>
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option) => (
              <div key={option.value} className="radio-wrapper">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  disabled={disabled}
                  className="form-radio"
                />
                <label htmlFor={`${fieldId}-${option.value}`} className="radio-label">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={fieldClasses}>
        {renderInput()}
        {error && <span className="field-error">{error}</span>}
        {hint && !error && <span className="field-hint">{hint}</span>}
      </div>
    );
  }

  return (
    <div className={fieldClasses}>
      {label && type !== 'checkbox' && (
        <label 
          htmlFor={fieldId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      {renderInput()}
      {error && <span className="field-error">{error}</span>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 'search',
    'textarea', 'select', 'file', 'checkbox', 'radio', 'date', 'time', 'datetime-local'
  ]),
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hint: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  rows: PropTypes.number,
  accept: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  autoComplete: PropTypes.string
};

export default FormField;
