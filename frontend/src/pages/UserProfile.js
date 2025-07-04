import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoCamera, IoTrash, IoSave, IoMailOutline, IoLockClosedOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { Header, Footer, PageTitle, BackButton } from '../components';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import getUserPhotoUrl from '../utils/getUserPhotoUrl';
import '../styles/UserProfile.css';
import { useDialog } from '../contexts/DialogContext';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState('photo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dialog = useDialog();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    async function syncUser() {
      try {
        const result = await UserService.fetchCurrentUserProfileAndSync();
        if (result.success && result.user) {
          setUser(result.user);
          setForm(prevForm => ({
            ...prevForm,
            name: result.user.name || '',
            email: result.user.email || '',
            username: result.user.username || '',
          }));
          setPhotoPreview(getUserPhotoUrl(result.user.photo));
        } else {
          throw new Error(result.message || 'Erro ao sincronizar perfil');
        }
      } catch (err) {
        const userData = AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setForm(prevForm => ({
            ...prevForm,
            name: userData.name || '',
            email: userData.email || '',
            username: userData.username || '',
          }));
          setPhotoPreview(getUserPhotoUrl(userData.photo));
        }
      }
    }
    syncUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setForm((prevForm) => ({
        ...prevForm,
        email: user.email || '',
        username: user.username || '',
      }));
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }

  async function handleRemovePhoto() {
    if (!user?.photo) {
      setPhotoFile(null);
      setPhotoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setError('');
      setSuccess('');
      return;
    }

    const confirmed = await dialog.confirm('Tem certeza que deseja remover sua foto de perfil?');
    if (!confirmed) return;

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await UserService.removeUserPhoto();
      if (result.success) {
        setSuccess('Foto removida com sucesso!');
        const updatedUser = { ...user, photo: null };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
        setPhotoFile(null);
        setPhotoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Recarrega a página após um breve delay para mostrar a mensagem
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.message || 'Erro ao remover foto');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setError('Selecione uma foto para fazer o upload');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const result = await UserService.uploadUserPhoto(photoFile, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (result.success) {
        setSuccess('Foto atualizada com sucesso!');
        const updatedUser = { ...user, photo: result.photoUrl };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Recarrega a página após um breve delay para mostrar a mensagem
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.message || 'Erro ao fazer upload da foto');
      }
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Tempo de requisição esgotado' : 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!form.email || form.email === user.email) {
        setError('Digite um novo email válido');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError('Formato de email inválido');
        return;
      }
      const result = await UserService.updateEmail(form.email);
      if (result.success) {
        setSuccess(result.message || 'Email atualizado com sucesso!');
        const updatedUser = { ...user, email: form.email };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
        
        // Recarrega a página após um breve delay para mostrar a mensagem
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.message || 'Erro ao atualizar email');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!form.username || form.username === user.username) {
        setError('Digite um novo login válido');
        return;
      }
      const result = await UserService.updateUsername(form.username);
      if (result.success) {
        setSuccess(result.message || 'Login atualizado com sucesso!');
        // Aguarda um pouco para mostrar a mensagem e depois redireciona
        setTimeout(() => {
          AuthService.logout();
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao atualizar login');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError('Preencha todos os campos de senha');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError('A nova senha e confirmação não coincidem');
        return;
      }
      if (form.newPassword.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres');
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      if (!passwordRegex.test(form.newPassword)) {
        setError('A nova senha deve conter: maiúscula, minúscula, número e caractere especial');
        return;
      }
      const result = await UserService.updatePassword(form.currentPassword, form.newPassword);
      if (result.success) {
        setSuccess(result.message || 'Senha atualizada com sucesso!');
        setForm((prevForm) => ({
          ...prevForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        // Aguarda um pouco para mostrar a mensagem e depois redireciona
        setTimeout(() => {
          AuthService.logout();
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao atualizar senha');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="page-header">
              <BackButton onClick={() => navigate('/main')} />
              
              <PageTitle
                icon={IoPersonOutline}
                title="Perfil do Usuário"
                subtitle="Gerencie suas informações"
                description="Atualize sua foto, dados pessoais e configurações de conta"
              />
            </div>
            
            <div className="glass-card">
              <div style={{ textAlign: 'center', color: 'var(--color-text-white)' }}>
                Carregando...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <BackButton onClick={() => navigate('/main')} />
            
            <PageTitle
              icon={IoPersonOutline}
              title="Perfil do Usuário"
              subtitle="Gerencie suas informações"
              description="Atualize sua foto, dados pessoais e configurações de conta"
            />
          </div>
          
          <div className="glass-card">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveTab('photo')}
              >
                <IoCamera />
                Foto
              </button>
              <button
                className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                <IoMailOutline />
                Email
              </button>
              <button
                className={`profile-tab ${activeTab === 'username' ? 'active' : ''}`}
                onClick={() => setActiveTab('username')}
              >
                <IoPersonCircleOutline />
                Login
              </button>
              <button
                className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <IoLockClosedOutline />
                Senha
              </button>
              <button
                className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <IoTrash />
                Conta
              </button>
            </div>
            {activeTab === 'photo' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Foto de perfil</h3>
                <div className="photo-container">
                  <div className="photo-wrapper">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Foto de perfil"
                        className="profile-photo"
                        onError={() => setPhotoPreview('')}
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <IoPersonOutline size={60} />
                        <br />
                        Nenhuma foto
                      </div>
                    )}
                  </div>
                  <label htmlFor="photo-input" className="photo-upload-btn">
                    <IoCamera />
                  </label>
                  {(photoPreview || photoFile) && (
                    <button
                      className="photo-remove-btn"
                      onClick={handleRemovePhoto}
                      disabled={loading}
                      title="Remover foto"
                    >
                      <IoTrash />
                    </button>
                  )}
                  <input
                    type="file"
                    id="photo-input"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <div className="photo-info">
                    A foto deve ter no máximo 5MB e estar nos formatos JPG, PNG ou GIF
                  </div>
                  {photoFile && (
                    <div className="photo-actions">
                      <button
                        className="modern-btn photo-action-btn"
                        onClick={handleUploadPhoto}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <IoSave size={16} />
                            Salvar foto
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'email' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar email</h3>
                <form onSubmit={handleUpdateEmail} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Email Atual</label>
                    <input
                      type="text"
                      value={user.email || ''}
                      className="modern-input"
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Novo Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Digite o novo email"
                      required
                    />
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Email'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'username' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar login</h3>
                <form onSubmit={handleUpdateUsername} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Login Atual</label>
                    <input
                      type="text"
                      value={user.username || ''}
                      className="modern-input"
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Novo Login *</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Digite o novo login"
                      required
                    />
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Login'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'password' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar senha</h3>
                <form onSubmit={handleUpdatePassword} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Senha Atual *</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Nova Senha *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Digite a nova senha"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Confirmar Nova Senha *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Confirme a nova senha"
                      required
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-gray-light)',
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}
                  >
                    Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&)
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'account' && (
              <div className="profile-section">
                <h3 className="profile-section-title" style={{ color: 'var(--color-danger)' }}>Excluir Conta</h3>
                <div style={{ textAlign: 'center', margin: '24px 0', color: 'var(--color-danger)', fontWeight: 500 }}>
                  Esta ação é <b>irreversível</b>. Todos os seus dados e eventos criados serão removidos.
                </div>
                <button
                  className="modern-btn danger-btn"
                  style={{ background: 'var(--color-danger)', color: '#fff', border: '2px solid #b00020', boxShadow: '0 2px 8px #b0002022', width: 220, margin: '0 auto', display: 'block' }}
                  onClick={async () => {
                    const password = await dialog.prompt('Digite sua senha para confirmar a exclusão da conta:', { type: 'password', label: 'Confirmar' });
                    if (!password) return;
                    const confirmed = await dialog.confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível.');
                    if (confirmed) {
                      setLoading(true);
                      setError('');
                      setSuccess('');
                      const result = await UserService.deleteAccount(password);
                      setLoading(false);
                      if (result.success) {
                        await dialog.alert('Conta deletada com sucesso!');
                        AuthService.logout();
                        navigate('/login');
                      } else {
                        setError(result.message || 'Erro ao deletar conta');
                      }
                    }
                  }}
                  disabled={loading}
                >
                  Deletar Conta
                </button>
              </div>
            )}
            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">{success}</div>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}