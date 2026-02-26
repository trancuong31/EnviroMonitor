import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>    
      <Toaster richColors position="top-center" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
