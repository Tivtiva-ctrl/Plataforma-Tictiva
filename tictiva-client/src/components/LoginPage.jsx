// Importamos nuestros estilos locales
import styles from './LoginPage.module.css';
// Importaremos el logo de Tictiva aquí cuando lo tengamos

function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        {/* === Columna Izquierda: Formulario === */}
        <div className={styles.formSection}>
          {/* <img src={logoTictiva} alt="Logo Tictiva" className={styles.logo} /> */}
          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>a tu plataforma de gestión</p>
          
          <p className={styles.tagline}>
            Humanizamos la gestión, digitalizamos tu tranquilidad.
          </p>

          <form className={styles.form}>
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" placeholder="ejemplo@empresa.com" />

            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" placeholder="•••••••••" />

            <div className={styles.formRow}>
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
        </div>

        {/* === Columna Derecha: Diseño de Marca === */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <h2>Más que marcar horarios, potenciamos personas.</h2>
            <p>
              Porque cuidar a las personas también es productividad.
            </p>
            {/* Aquí iría el gráfico abstracto adaptado de la Imagen 3 */}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;