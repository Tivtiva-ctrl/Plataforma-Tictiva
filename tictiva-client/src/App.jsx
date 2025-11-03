import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import { supabase } from './supabaseClient'; 

function App() {
  // 👇 Volvemos al estado simple: empieza en false siempre
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Cerrar sesión: cerramos en Supabase y volvemos al login
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    } finally {
      // Pase lo que pase, nuestra app vuelve a estado "no logueada"
      setIsLoggedIn(false);
    }
  };

  return (
    <Routes>
      {/* RUTA LOGIN */}
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

      {/* RUTA DASHBOARD + TODO LO DEMÁS */}
      <Route 
        path="/dashboard/*"
        element={
          isLoggedIn ? (
            <DashboardPage onLogout={handleLogout} />
          ) : (
            // Si no está logueada, SIEMPRE te lleva al login
            <Navigate to="/" />
          )
        } 
      />
    </Routes>
  );
}

export default App;
