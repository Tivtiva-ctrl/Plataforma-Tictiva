import { useState } from 'react'; 
import styles from './LoginPage.module.css';
// 1. ¡IMPORTAMOS NUESTRO CLIENTE DE SUPABASE!
import { supabase } from '../supabaseClient';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2. NUEVOS ESTADOS para manejar el login real
  const [loading, setLoading] = useState(false); // Para el estado "cargando..."
  const [error, setError] = useState(null);     // Para mostrar mensajes de error

  // 3. ESTA ES LA NUEVA FUNCIÓN DE LOGIN
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevenir recarga de página
    
    setLoading(true); // Empezamos a cargar
    setError(null);   // Limpiamos errores antiguos

    try {
      // 4. ¡LA LLAMADA MÁGICA A SUPABASE!
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Si Supabase da un error (ej. "Invalid login credentials")
        throw error;
      }
      
      // 5. ¡ÉXITO! Si no hay error, le avisamos a App.jsx
      console.log("¡Inicio de sesión exitoso!", data);
      onLoginSuccess();

    } catch (error) {
      // 6. Si hay un error, lo mostramos al usuario
      console.error("Error en el login:", error.message);
      // Damos un mensaje amigable
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
    } finally {
      // 7. Pase lo que pase, dejamos de cargar
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
              required // Hacemos que el campo sea obligatorio
            />

            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Hacemos que el campo sea obligatorio
            />

            {/* 8. MOSTRAMOS EL MENSAJE DE ERROR SI EXISTE */}
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

            {/* 9. DESACTIVAMOS EL BOTÓN MIENTRAS CARGA */}
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className={styles.registerLink}>
            ¿No tienes cuenta? <a href="#">Regístrate</a>
          </p>

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