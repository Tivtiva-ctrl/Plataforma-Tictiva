import { useState } from 'react'; 
import styles from './LoginPage.module.css';

// 1. Aceptamos la nueva prop { onLoginSuccess }
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Hacemos la función 'async' (preparándonos para Supabase)
  const handleLogin = async (event) => {
    event.preventDefault(); 

    console.log('¡Intentando iniciar sesión!');
    console.log('Email:', email);
    console.log('Contraseña:', password);
    
    // === ¡AQUÍ ESTÁ LA MAGIA! ===
    // 3. En lugar de solo un console.log, llamamos a la función
    //    que App.jsx nos pasó.
    
    // En el futuro, aquí iría la lógica de Supabase.
    // try {
    //   await supabase.auth.signInWithPassword({ email, password });
    // } catch (error) {
    //   // manejar error
    // }

    // Por ahora, simulamos un éxito instantáneo:
    console.log("¡Simulación de login exitosa!");
    onLoginSuccess(); // <-- Esto le dice a App.jsx que cambie el estado
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        <div className={styles.formSection}>
          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>a tu plataforma de gestión</p>
          
          <p className={styles.tagline}>
            Impulsamos el talento. Automatizamos la gestión.
          </p>

          <form className={styles.form} onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              placeholder="ejemplo@empresa.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />

            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className={styles.formRow}>
              {/* ... (resto del formulario) ... */}
              <div className={styles.formCheck}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recuérdame</label>
              </div>
              <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Iniciar sesión
            </button>
          </form>

          <p className={styles.registerLink}>
            ¿No tienes cuenta? <a href="#">Regístrate</a>
          </p>

          <div className={styles.fiscalizacionSection}>
            {/* ... (resto de la sección) ... */}
            <a href="#" className={styles.fiscalizacionLink}>
              Acceso para Fiscalización DT 
              <span className={styles.arrowIcon}>→</span>
            </a>
            <p className={styles.fiscalizacionInfo}>
              Acceso temporal para fiscalizadores según normativa legal
            </p>
          </div>
        </div>

        <div className={styles.brandSection}>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;