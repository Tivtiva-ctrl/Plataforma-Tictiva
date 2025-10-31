// 1. Importamos las herramientas que necesitamos de React Router
import { Routes, Route, Navigate } from 'react-router-dom';
// (También importamos 'useState' para simular el inicio de sesión)
import { useState } from 'react';

// 2. Importamos TUS dos páginas
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  // --- Lógica de Autenticación (Simple por ahora) ---
  // Esta es nuestra "llave maestra". 
  // Empezamos en 'false' (no hemos iniciado sesión).
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Esta es la función que LoginPage usará para "avisarnos" que se inició sesión
  // Por ahora, solo es una simulación.
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    // 3. 'Routes' es el contenedor para todas tus rutas
    <Routes>
      
      {/* Ruta 1: La Página de Login (path="/")
        - Si el usuario NO está logueado, muestra <LoginPage />.
        - Si SÍ está logueado, lo "redirige" (Navigate) a "/dashboard".
      */}
      <Route 
        path="/" 
        element={
          !isLoggedIn ? <LoginPage /> : <Navigate to="/dashboard" />
        } 
      />

      {/* Ruta 2: El Dashboard (path="/dashboard")
        - Si el usuario SÍ está logueado, muestra <DashboardPage />.
        - Si NO está logueado, lo "patea" de vuelta al login ("/").
      */}
      <Route 
        path="/dashboard" 
        element={
          isLoggedIn ? <DashboardPage /> : <Navigate to="/" />
        } 
      />
      
      {/* Puedes añadir más rutas aquí, como /registro, etc. */}
    
    </Routes>
  )
}

export default App;