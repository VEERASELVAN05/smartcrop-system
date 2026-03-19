import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelect from './pages/LanguageSelect';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmProfile from './pages/FarmProfile';
import Dashboard from './pages/Dashboard';
import Insurance from './pages/Insurance';

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
        <Route path="/insurance" element={<Insurance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;