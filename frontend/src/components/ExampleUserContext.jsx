

import React from 'react';
import { useUser } from '../contexts/UserContext';
import getUserPhotoUrl from '../utils/getUserPhotoUrl';

const ExampleUserContext = () => {
  const { user, loading, error, loadUserProfile } = useUser();

  if (loading) {
    return <div>Carregando informações do usuário...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Erro: {error}</p>
        <button onClick={loadUserProfile}>Tentar novamente</button>
      </div>
    );
  }

  if (!user) {
    return <div>Usuário não está logado</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Informações do Usuário (Contexto)</h2>
      <p><strong>Nome:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Foto:</strong></p>
      {user.photo ? (
        <img 
          src={getUserPhotoUrl(user.photo)} 
          alt="Foto do usuário" 
          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
        />
      ) : (
        <span>Sem foto definida</span>
      )}
      <br />
      <button onClick={loadUserProfile} style={{ marginTop: '10px' }}>
        Recarregar Perfil
      </button>
    </div>
  );
};

export default ExampleUserContext;
