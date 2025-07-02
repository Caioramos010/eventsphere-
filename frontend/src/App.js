import './styles/App.css';
import AppRouter from './AppRouter';
import { UserProvider } from './contexts/UserContext';
import { DialogProvider } from './contexts/DialogContext';

function App() {
  return (
    <UserProvider>
      <DialogProvider>
        <AppRouter />
      </DialogProvider>
    </UserProvider>
  );
}

export default App;