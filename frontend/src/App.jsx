import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>    
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
