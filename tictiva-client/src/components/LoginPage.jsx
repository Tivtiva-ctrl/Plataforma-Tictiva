import styles from './LoginPage.module.css';

function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        {/* === Columna Izquierda: Formulario === */}
        <div className={styles.formSection}>
          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>a tu plataforma de gestión</p>
          
          {/* AQUÍ ESTÁ EL CAMBIO DE ESLOGAN */}
          <p className={styles.tagline}>
            Impulsamos el talento. Automatizamos la gestión.
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

          {/* === Sección de Acceso Fiscalización DT === */}
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

        {/* === Columna Derecha: Diseño de Marca === */}
        <div className={styles.brandSection}>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;