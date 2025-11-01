import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
// 1. Importamos supabase aquí también
import { supabase } from './supabaseClient'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // ===============================================
  // === ¡AQUÍ ESTÁ LA FUNCIÓN DE CERRAR SESIÓN REAL! ===
  // ===============================================
  const handleLogout = async () => {
    try {
      // 2. Le decimos a Supabase que cierre la sesión
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 3. Solo si Supabase tiene éxito, actualizamos nuestro estado
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
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
        path="/dashboard/*"
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