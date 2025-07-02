import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const InviteRedirect = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      
      navigate(`/join-event/${token}`);
    } else {
      
      navigate(`/login?token=${token}`);
    }
  }, [token, navigate]);

  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Redirecionando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InviteRedirect;
