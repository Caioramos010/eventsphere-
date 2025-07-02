import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import UserService from './services/UserService';

function AppWithUserSync() {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      UserService.fetchCurrentUserProfileAndSync();
    }
  }, []);
  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithUserSync />
  </React.StrictMode>
);
