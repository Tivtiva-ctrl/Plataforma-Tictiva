// 1. Hemos "comentado" (desactivado) la importación de LoginPage
// import LoginPage from './components/LoginPage';

// 2. Hemos "importado" (activado) tu nuevo DashboardPage
import DashboardPage from './components/DashboardPage';

function App() {
  
  // 3. Estamos devolviendo el componente DashboardPage
  return (
    <DashboardPage />
    
    // <LoginPage /> // La página de login está desactivada temporalmente
  )
}

export default App