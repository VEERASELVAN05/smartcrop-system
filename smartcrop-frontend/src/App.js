import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelect from './pages/LanguageSelect';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmProfile from './pages/FarmProfile';
import Dashboard from './pages/Dashboard';
import Insurance from './pages/Insurance';
import Chatbot from './pages/Chatbot';
import GovernmentDashboard from './pages/GovernmentDashboard';



function App() {
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language');

  return (
    <BrowserRouter>
      <Routes>
        {/* First screen — language selection */}
        <Route path="/" element={
          !language ? <LanguageSelect /> :
          token ? <Navigate to="/dashboard" /> :
          <Navigate to="/login" />
        } />
        <Route path="/language" element={<LanguageSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<FarmProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
      <Routes>
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/government" element={<GovernmentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;