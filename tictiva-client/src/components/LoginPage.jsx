import styles from './LoginPage.module.css';
// 1. Importa tu imagen. 
// Asegúrate de que el nombre 'tictiva-brand-image.png' coincida con el nombre de tu archivo.
import brandImage from '../assets/tictiva-brand-image.png'; 

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
          {/* 2. Aquí está la imagen en lugar del texto */}
          <img 
            src={brandImage} 
            alt="Branding Tictiva" 
            className={styles.brandImage}
          />
        </div>

      </div>
    </div>
  );
}

export default LoginPage;