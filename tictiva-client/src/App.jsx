import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Routes>
      
      <Route 
        path="/" 
        element={
          !isLoggedIn ? (
            // === ¡AQUÍ ESTÁ EL CAMBIO! ===
            // Le pasamos la función a LoginPage
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/dashboard" />
          )
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          isLoggedIn ? <DashboardPage /> : <Navigate to="/" />
        } 
      />
    
    </Routes>
  )
}

export default App;