import React, { useState } from 'react';
import './Welcome.css';

const Welcome = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <section className="welcome-wrapper">
      {/* BLOQUE IZQUIERDO */}
      <div className="left-side">
        <div className="title-block">
          <p className="title">ALMITA _ VIRTUAL</p>
        </div>

        <div className="description-block">
          <p className="description">
            SUBE TU CV, TU CARTA DE PRESENTACIÓN O TU DOCUMENTO DIGITAL Y CONVIERTE SU PRESENTACIÓN EN UNA FORMA ORIGINAL Y PERSONAL DE COMPARTIRLOS.
          </p>
        </div>

        <div className="menu-block">
          <div className="grouped-items">
            <p className="menu-item first" onClick={() => setActiveSection('info')}>INFO _</p>

            <p className="menu-item second">
              <span onClick={() => setActiveSection('comenzar')}>COMENZAR _</span>
              {activeSection === 'comenzar' && (
                <>
                  <span onClick={() => setActiveSection('login')} className="sub-item"> INICIAR SESIÓN _</span>
                  <span onClick={() => setActiveSection('register')} className="sub-item"> REGISTRARSE _</span>
                </>
              )}
            </p>
          </div>

          <p className="menu-item spaced" onClick={() => setActiveSection('hola')}>[HOLA]</p>
        </div>
      </div>

      {/* BLOQUE DERECHO */}
      <div className="right-side">

        {activeSection === 'info' && (
          <div className="info-box">
            <div className="info-text">
              <p>
                "Almita Virtual" es una App web donde cada usuario puede crear entornos personalizados que sirven como espacio digital para presentar o compartir su currículum, carta de presentación u otros documentos importantes.
              </p>
              <p>
                Cada entorno está representado visualmente por una Almita, un personaje animado que cambia de estado según la interacción del usuario o visitante. La propuesta combina solidez técnica con una experiencia estética sensible y simbólica.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'comenzar' && (
          <div className="info-box">
            <p className="info-text">
              Iniciá sesión si ya tenés una cuenta, o registrate para crear tu entorno digital.
            </p>
          </div>
        )}

        {activeSection === 'login' && (
          <div className="info-box">
            <form className="form-box">
              <label>Usuario
                <input type="text" placeholder="Tu nombre de usuario" required minLength="4" maxLength="20" />
              </label>
              <label>Contraseña
                <input type="password" placeholder="Tu contraseña" required minLength="8" />
              </label>
              <button type="submit">Iniciar Sesión</button>
            </form>
          </div>
        )}

        {activeSection === 'register' && (
          <div className="info-box">
            <form className="form-box">
              <label>Usuario
                <input type="text" placeholder="Tu nombre de usuario" required minLength="4" maxLength="20" />
              </label>
              <label>Contraseña
                <input
                  type="password"
                  placeholder="Tu contraseña con mínimo 8 caracteres"
                  required
                  minLength="8"
                />
              </label>
              <span className="hint">Debe contener al menos una letra mayúscula, un número y un carácter especial.</span>
              <button type="submit">Registrarse</button>
            </form>
          </div>
        )}

        {activeSection === 'hola' && (
          <div className="info-box">
            <img
              src="https://res.cloudinary.com/dwk4mvgtp/image/upload/v1744849074/pngwing.com_rid2zl.png"
              alt="Almita Animada"
              className="almita-image"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Welcome;