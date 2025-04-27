import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import './Welcome.css';

// 🔍 Decodifica el token para extraer el nombre de usuario
function getUsernameFromToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || 'Usuario';
  } catch (err) {
    console.error('Token inválido:', err);
    return 'Usuario';
  }
}

// 🔍 Extrae el rol desde el JWT (acepta distintos formatos posibles del token)
function getRoleFromToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    console.log("🎯 Token decodificado:", decoded);
    return decoded.role || decoded.authorities?.[0]?.authority || null;
  } catch (err) {
    console.error('Token inválido:', err);
    return null;
  }
}

const Welcome = () => {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const [loginSuccess, setLoginSuccess] = useState(false); // 🟢 Login exitoso
  const [pendingRole, setPendingRole] = useState(null); // 👑 Rol pendiente para redirigir

  // 🧭 Redirección segura después de login
  useEffect(() => {
    if (loginSuccess && pendingRole) {
      if (pendingRole === 'ROLE_ADMIN') {
        alert('🔵 Bienvenida Admin');
        navigate('/admin');
      } else if (pendingRole === 'ROLE_USER') {
        alert('🟢 Bienvenida Usuario');
        navigate('/profile');
      } else {
        alert('❌ Rol desconocido. No tienes acceso.');
      }
    }
  }, [loginSuccess, pendingRole]);

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

        {/* 🎨 INFO */}
        {activeSection === 'info' && (
          <div className="info-box">
            <div className="info-text">
              <p><span className="highlighted-section">"Almita Virtual" </span>es una App web donde cada usuario puede crear entornos personalizados para presentar o compartir sus documentos importantes, como el Currículum Vitae o carta de presentación.</p>
              <p>Cada entorno está representado por un personaje "Almita" que cambia de estado según la interacción del usuario o visitante. La propuesta combina solidez técnica con una experiencia estética sensible y simbólica.</p>
            </div>
          </div>
        )}

        {/* ✨ COMENZAR */}
        {activeSection === 'comenzar' && (
          <div className="info-box">
            <p className="info-text">
              Iniciá sesión si ya tenés una cuenta, o registrate para crear tu entorno digital.
            </p>
          </div>
        )}

        {/* 🔐 LOGIN */}
        {activeSection === 'login' && (
          <div className="info-box">
            <form
              className="form-box"
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target[0].value;
                const password = e.target[1].value;

                try {
                  const response = await fetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                  });

                  if (!response.ok) {
                    const errorJson = await response.json();
                    alert('❌ Error: ' + (errorJson.message || 'Error desconocido'));
                    return;
                  }

                  const data = await response.json();
                  const token = data.token;
                  localStorage.setItem('token', token);

                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const role = payload.role || payload.authorities?.[0]?.authority;

                  if (role === 'ROLE_ADMIN') {
                    alert('🔵 Bienvenida Admin');
                    window.location.href = '/admin';
                  } else if (role === 'ROLE_USER') {
                    alert('🟢 Bienvenida Usuario');
                    window.location.href = '/profile';
                  } else {
                    alert('❌ Rol desconocido. No tienes acceso.');
                  }
                } catch (err) {
                  alert('❌ Error de red: ' + err.message);
                }
              }}
            >
              <label>Usuario
                <input
                  type="text"
                  name="username"
                  placeholder="Tu nombre de usuario"
                  required
                  minLength="4"
                  maxLength="20"
                />
              </label>

              <label>Contraseña
                <input
                  type="password"
                  name="password"
                  placeholder="Tu contraseña"
                  required
                  minLength="8"
                />
              </label>

              <button type="submit">Iniciar sesión</button>
            </form>
          </div>
        )}


        {/* 🧾 REGISTRO */}
        {activeSection === 'register' && (
          <div className="info-box">
            <form
              className="form-box"
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.username.value;
                const password = e.target.password.value;

                try {
                  const response = await fetch('http://localhost:8080/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                  });

                  if (response.ok) {
                    alert('🟢 Usuario registrado correctamente');
                    setActiveSection('login');
                  } else {
                    const errorJson = await response.json();
                    alert('❌ Error: ' + (errorJson.message || 'Error desconocido'));
                  }
                } catch (err) {
                  alert('❌ Error de red: ' + err.message);
                }
              }}
            >
              <label>
                Usuario
                <input
                  type="text"
                  name="username"
                  placeholder="Tu nombre de usuario"
                  required
                  minLength="4"
                  maxLength="20"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  placeholder="Tu contraseña con mínimo 8 caracteres"
                  required
                  minLength="8"
                />
              </label>

              <span className="hint">
                Debe contener al menos una letra mayúscula, un número y un carácter especial.
              </span>

              <button type="submit">Registrarse</button>
            </form>
          </div>
        )}

        {activeSection === 'hola' && (
          <div className="info-box">
            <AlmitaDisplay status="ACTIVE" color="YELLOW" />
          </div>
        )}
      </div>
    </section>
  );
};

export default Welcome;
