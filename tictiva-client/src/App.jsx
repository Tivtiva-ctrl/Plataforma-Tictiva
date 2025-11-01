import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      
      <Route 
        path="/" 
        element={
          !isLoggedIn ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/dashboard" />
          )
        } 
      />

      {/* =============================================== */}
      {/* === ¡AQUÍ ESTÁ EL CAMBIO! Añadimos '/*' === */}
      {/* =============================================== */}
      <Route 
        path="/dashboard/*" // <-- ¡EL ASTERISCO ES NUEVO!
        element={
          isLoggedIn ? (
            <DashboardPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/" />
          )
        } 
      />
    
    </Routes>
  )
}

export default App;