import { useState } from 'react'; 
import styles from './LoginPage.module.css';
import { supabase } from '../supabaseClient';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);     

  const handleLogin = async (event) => {
    event.preventDefault(); 
    setLoading(true);
    setError(null);   

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      console.log("¡Inicio de sesión exitoso!", data);
      onLoginSuccess();

    } catch (error) {
      console.error("Error en el login:", error.message);
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        <div className={styles.formSection}>
          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>a tu plataforma de gestión</p>
          <p className={styles.tagline}>Impulsamos el talento. Automatizamos la gestión.</p>

          <form className={styles.form} onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              placeholder="ejemplo@empresa.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className={styles.errorText}>{error}</p>
            )}

            <div className={styles.formRow}>
              <div className={styles.formCheck}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recuérdame</label>
              </div>
              <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* =============================================== */}
          {/* === ¡HEMOS ELIMINADO EL ENLACE "REGÍSTRATE"! === */}
          {/* =============================================== */}
          {/* <p className={styles.registerLink}>
            ¿No tienes cuenta? <a href="#">Regístrate</a>
          </p> 
          */}

          <div className={styles.fiscalizacionSection}>
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