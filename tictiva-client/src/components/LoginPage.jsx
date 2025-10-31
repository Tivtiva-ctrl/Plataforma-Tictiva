// 1. Importamos 'useState' desde React. Esta es la herramienta para crear "estados" (memoria).
import { useState } from 'react'; 
import styles from './LoginPage.module.css';

function LoginPage() {
  // 2. Creamos dos "estados" para guardar el email y la contraseña.
  //    Empiezan como un texto vacío ('').
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. Creamos una función que se ejecutará cuando se envíe el formulario.
  const handleLogin = (event) => {
    // Esto previene que la página se recargue (comportamiento por defecto de un formulario)
    event.preventDefault(); 

    // Por ahora, solo mostraremos los datos en la consola para probar
    console.log('¡Intentando iniciar sesión!');
    console.log('Email:', email);
    console.log('Contraseña:', password);
    
    // El próximo paso será enviar 'email' y 'password' a Supabase aquí.
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

          {/* 4. Conectamos nuestra función 'handleLogin' al 'onSubmit' del formulario */}
          <form className={styles.form} onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              placeholder="ejemplo@empresa.com"
              // Conectamos el valor del input a nuestro estado 'email'
              value={email} 
              // Cada vez que el usuario teclea, actualizamos el estado 'email'
              onChange={(e) => setEmail(e.target.value)} 
            />

            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              placeholder="•••••••••"
              // Conectamos el valor del input a nuestro estado 'password'
              value={password}
              // Cada vez que el usuario teclea, actualizamos el estado 'password'
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className={styles.formRow}>
              <div className={styles.formCheck}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recuérdame</label>
              </div>
              <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
            </div>

            {/* El botón 'submit' dentro de un <form> activará el 'onSubmit' */}
            <button type="submit" className={styles.btnPrimary}>
              Iniciar sesión
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