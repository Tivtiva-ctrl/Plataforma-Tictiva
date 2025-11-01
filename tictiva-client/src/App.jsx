import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // ===============================================
  // === ¡AQUÍ ESTÁ LA FUNCIÓN DE CERRAR SESIÓN! ===
  // ===============================================
  const handleLogout = () => {
    setIsLoggedIn(false);
    // En el futuro, también llamaríamos a supabase.auth.signOut() aquí
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

      <Route 
        path="/dashboard" 
        element={
          isLoggedIn ? (
            // ===============================================
            // === ¡LE PASAMOS LA FUNCIÓN AL DASHBOARD! ===
            // ===============================================
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