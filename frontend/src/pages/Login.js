import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/auth.css';
import logo from '../images/logo-login.png';
import AuthService from '../services/AuthService';
import { useUser } from '../contexts/UserContext';
import { useFormState } from '../hooks/useFormState';
import { 
  validateRequired } from '../utils/validators';
import { StandardButton, Message, FormField, PasswordField } from '../components';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserProfile } = useUser();

  const { values, errors, handleChange, validate, isValid } = useFormState({
    login: '',
    senha: ''
  }, {
    login: [validateRequired('Login é obrigatório')],
    senha: [validateRequired('Senha é obrigatória')]
  });

  
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      
      const inviteToken = searchParams.get('token');
      if (inviteToken) {
        navigate(`/join-event/${inviteToken}`);
      } else {
        navigate('/main');
      }
    } else {
      // Verificar se o usuário acabou de se registrar
      const registered = searchParams.get('registered');
      if (registered) {
        setMessage({ 
          text: 'Registro realizado com sucesso! Faça login para continuar.', 
          type: 'success' 
        });
      }
    }
  }, [navigate, searchParams]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setMessage({ text: 'Por favor, corrija os erros no formulário', type: 'error' });
      return;
    }
    
    setMessage({ text: '', type: '' });
    setLoading(true);
    
    try {
      const credentials = {
        username: values.login,
        password: values.senha
      };
      
      const result = await AuthService.login(credentials);
      
      if (result.success) {
        // Aguardar um pouco para garantir que o token foi salvo
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Carregar o perfil do usuário e aguardar
        try {
          await loadUserProfile();
          
          // Aguardar mais um pouco para garantir que o contexto foi atualizado
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const inviteToken = searchParams.get('token');
          if (inviteToken) {
            navigate(`/join-event/${inviteToken}`);
          } else {
            navigate('/main');
          }
        } catch (profileError) {
          console.error('Error loading profile:', profileError);
          // Mesmo com erro no perfil, redirecionar
          const inviteToken = searchParams.get('token');
          if (inviteToken) {
            navigate(`/join-event/${inviteToken}`);
          } else {
            navigate('/main');
          }
        }
      } else {
        setMessage({ text: result.message || 'Login ou senha inválidos', type: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
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
          <FormField
            label="LOGIN"
            type="text"
            name="login"
            value={values.login}
            onChange={handleChange}
            error={errors.login}
            placeholder="Digite seu login"
            required
          />
          
          <PasswordField
            label="SENHA"
            name="senha"
            value={values.senha}
            onChange={handleChange}
            error={errors.senha}
            placeholder="Digite sua senha"
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
            LOGIN
          </StandardButton>
        </form>
          <div className="auth-switch">
          Não possui login? <span className="auth-link" onClick={() => {
            const inviteToken = searchParams.get('token');
            if (inviteToken) {
              navigate(`/register?token=${inviteToken}`);
            } else {
              navigate('/register');
            }
          }}>Faça o registro agora</span>
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

export default Login;