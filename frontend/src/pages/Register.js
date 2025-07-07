import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoCamera, IoTrash } from 'react-icons/io5';
import '../styles/auth.css';
import logo from '../images/logo-login.png';
import AuthService from '../services/AuthService';
import { useFormState } from '../hooks/useFormState';
import { validateRequired, validateEmail, validateStrongPassword, validateOnlyLetters } from '../utils/validators';
import { StandardButton, Message, FormField, PasswordField } from '../components';

const Register = () => {
  const [foto, setFoto] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { values, errors, handleChange, validate, isValid } = useFormState({
    nome: '',
    email: '',
    login: '',
    senha: ''
  }, {
    nome: [validateRequired('Nome é obrigatório'), validateOnlyLetters()],
    email: [validateRequired('E-mail é obrigatório'), validateEmail()],
    login: [validateRequired('Login é obrigatório')],
    senha: [validateRequired('Senha é obrigatória'), validateStrongPassword()]
  });
  
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      const inviteToken = searchParams.get('token');
      if (inviteToken) {
        navigate(`/join-event/${inviteToken}`);
      } else {
        navigate('/main');
      }
    }
  }, [navigate, searchParams]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Por favor, selecione apenas arquivos de imagem', type: 'error' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'A imagem deve ter no máximo 5MB', type: 'error' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFoto(base64);
        setFotoPreview(base64);
        setMessage({ text: '', type: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setFoto('');
    setFotoPreview('');
    const fileInput = document.getElementById('foto-input');
    if (fileInput) fileInput.value = '';
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    
    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '');
    
    const cleanedValue = filteredValue.replace(/\s{2,}/g, ' ');
    
    const syntheticEvent = {
      target: {
        name: 'nome',
        value: cleanedValue
      }
    };
    
    handleChange(syntheticEvent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setMessage({ text: 'Por favor, corrija os erros no formulário', type: 'error' });
      return;
    }
    
    setMessage({ text: '', type: '' });
    setLoading(true);
    
    try {
      const userData = {
        name: values.nome,
        email: values.email,
        username: values.login,
        password: values.senha,
        photo: foto
      };
      
      const result = await AuthService.register(userData);
      
      if (result.success) {
        setMessage({ text: result.message || 'Registro realizado com sucesso!', type: 'success' });
        
        const inviteToken = searchParams.get('token');
        if (inviteToken) {
          // Em vez de fazer login automático, redirecionar para login com token
          setTimeout(() => {
            navigate(`/login?token=${inviteToken}&registered=true`);
          }, 1200);
        } else {
          setTimeout(() => navigate('/login'), 1200);
        }
      } else {
        setMessage({ text: result.message || 'Erro ao registrar usuário', type: 'error' });
      }
    } catch (err) {
      console.error('Register error:', err);
      setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src={logo} alt="EventSphere" className="auth-logo" />
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-photo-section">
            {fotoPreview ? (
              <div className="auth-photo-preview">
                <img src={fotoPreview} alt="Preview" className="auth-photo-img" />
                <button 
                  type="button" 
                  className="auth-photo-remove"
                  onClick={handleRemoveFoto}
                >
                  <IoTrash size={14} />
                </button>
              </div>
            ) : (
              <div className="auth-photo-placeholder">
                <IoCamera size={30} />
                <p>Adicionar foto</p>
              </div>
            )}
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="auth-photo-input"
            />
          </div>
          
          <FormField
            label="NOME"
            type="text"
            name="nome"
            value={values.nome}
            onChange={handleNameChange}
            error={errors.nome}
            placeholder="Digite seu nome completo"
            required
          />
          
          <FormField
            label="E-MAIL"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Digite seu e-mail"
            required
          />
          
          <FormField
            label="LOGIN"
            type="text"
            name="login"
            value={values.login}
            onChange={handleChange}
            error={errors.login}
            placeholder="Escolha um login"
            required
          />
          
          <PasswordField
            label="SENHA"
            name="senha"
            value={values.senha}
            onChange={handleChange}
            error={errors.senha}
            placeholder="Crie uma senha"
            showRequirements={true}
            required
          />
          
          {message.text && (
            <Message 
              message={message.text} 
              type={message.type} 
              onClose={() => setMessage({ text: '', type: '' })}
            />
          )}
          
          <StandardButton 
            type="submit" 
            variant="primary" 
            size="large"
            fullWidth 
            loading={loading}
            disabled={loading || !isValid}
          >
            REGISTRO
          </StandardButton>
        </form>
          <div className="auth-switch">
          Já possui login? <span className="auth-link" onClick={() => {
            const inviteToken = searchParams.get('token');
            if (inviteToken) {
              navigate(`/login?token=${inviteToken}`);
            } else {
              navigate('/login');
            }
          }}>Logue agora</span>
        </div>
      </div>
      
      <div className="auth-shapes">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
      </div>
    </div>
  );
};

export default Register;
