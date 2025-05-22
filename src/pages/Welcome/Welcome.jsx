import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import ModalBase from "../../components/atoms/ModalBase";
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
  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [modalConfig, setModalConfig] = useState(null);
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setLoginError("");
    setRegisterError("");
  }, [activeSection]);

  // ☑️ Redirección segura después de login
  useEffect(() => {
    if (loginSuccess && pendingRole) {
      if (pendingRole === 'ROLE_ADMIN') {
        alert('// Bienvenida Admin');
        navigate('/admin');
      } else if (pendingRole === 'ROLE_USER') {
        alert('// Bienvenida Usuario');
        navigate('/profile');
      } else {
        alert('// Rol desconocido. No tienes acceso.');
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

            <div className="grouped-items">
              <p className="menu-item">
                <span onClick={() => setActiveSection(activeSection === 'comenzar' ? null : 'comenzar')}>
                  COMENZAR&nbsp;_
                </span>
              </p>

              {activeSection === 'comenzar' && (
                <>
                  <p className="sub-item" onClick={() => setActiveSection('login')}>
                    INICIAR SESIÓN&nbsp;_
                  </p>
                  <p className="sub-item" onClick={() => setActiveSection('register')}>
                    REGISTRARSE&nbsp;_
                  </p>
                </>
              )}
            </div>

            {isLoggedIn && (
              <div className="grouped-items">
                <p className="menu-item">
                  <span onClick={() => setActiveSection(activeSection === 'perfil' ? null : 'perfil')}>
                    PERFIL&nbsp;_
                  </span>
                </p>

                {activeSection === 'perfil' && (
                  <>
                    {(() => {
                      const token = localStorage.getItem('token');
                      const role = getRoleFromToken(token);

                      if (role === 'ROLE_USER') {
                        return (
                          <p className="sub-item" onClick={() => navigate('/profile')}>
                            IR A PERFIL&nbsp;_
                          </p>
                        );
                      } else if (role === 'ROLE_ADMIN') {
                        return (
                          <p className="sub-item" onClick={() => navigate('/admin')}>
                            IR AL PANEL&nbsp;_
                          </p>
                        );
                      } else {
                        return null;
                      }
                    })()}
                    <p className="sub-item" onClick={() => setShowLogoutModal(true)}>
                      CERRAR SESIÓN&nbsp;_
                    </p>
                  </>
                )}
              </div>
            )}

          </div>
          <p className="menu-item spaced" onClick={() => setActiveSection('hola')}>[HOLA]</p>
        </div>
      </div>

      {/* BLOQUE DERECHO */}
      <div className="right-side">

        {/* 🔘 INFO */}
        {activeSection === 'info' && (
          <div className="info-box">
            <div className="info-text">
              <p><span className="highlighted-section">"Almita Virtual" </span>es una App web donde cada usuario puede crear entornos personalizados para presentar o compartir sus documentos importantes, como el Currículum Vitae o carta de presentación.</p>
              <p>Cada entorno está representado por un personaje "Almita" que cambia de estado según la interacción del usuario o visitante. La propuesta combina solidez técnica con una experiencia estética sensible y simbólica.</p>
            </div>
          </div>
        )}

        {/* 🔘 COMENZAR */}
        {activeSection === 'comenzar' && (
          <div className="info-box">
            <p className="info-text">
              <span className="highlighted-section">Iniciá sesión</span> si ya tenés una cuenta, o <span className="highlighted-section">registrate</span> para crear tu entorno digital.
            </p>
          </div>
        )}

        {/* 🔘 LOGIN */}
        {activeSection === 'login' && (
          <div className="info-box">
            <form
              className="form-box"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.username.value.trim();
                const password = e.target.password.value.trim();

                setLoginError("");

                if (username.length < 4) {
                  setLoginError("⚠️ Debes ingresar un nombre de usuario registrado.");
                  return;
                }

                if (!password) {
                  setLoginError("⚠️ La contraseña es obligatoria.");
                  return;
                }

                try {
                  const response = await fetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                  });

                  if (!response.ok) {
                    const errorJson = await response.json();
                    setModalConfig({
                      message: `// Error: ${errorJson.message || 'Error desconocido'}`,
                      confirmText: "Aceptar"
                    });
                    return;
                  }

                  const data = await response.json();
                  const token = data.token;
                  localStorage.setItem('token', token);

                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const role = payload.role || payload.authorities?.[0]?.authority;

                  if (role === 'ROLE_ADMIN') {
                    setModalConfig({
                      message: "// Bienvenida Admin",
                      confirmText: "Ir al panel",
                      onConfirm: () => { window.location.href = '/admin'; }
                    });
                  } else if (role === 'ROLE_USER') {
                    setModalConfig({
                      message: `// Bienvenida/o ${username}`,
                      confirmText: "Ir a mi perfil",
                      onConfirm: () => { window.location.href = '/profile'; }
                    });
                  } else {
                    setModalConfig({
                      message: "// Rol desconocido. No tienes acceso.",
                      confirmText: "Aceptar"
                    });
                  }
                } catch (err) {
                  console.error('// Error inesperado en login:', err);
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

              <p
                className="forgot-password-link"
                onClick={() => setActiveSection('recover')}
              >
                ¿Olvidaste tu contraseña?
              </p>

              {loginError && <span className="error-msg">{loginError}</span>}
            </form>
          </div>
        )}

        {/* 🔘 RECOVER PASSWORD */}
        {activeSection === 'recover' && (
          <div className="info-box">
            <form
              className="form-box"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.username.value.trim();
                const recoveryKey = e.target.recoveryKey.value.trim();
                const newPassword = e.target.newPassword.value.trim();

                setLoginError("");

                if (!username) {
                  setLoginError("⚠️ Debes ingresar un nombre de usuario registrado.");
                  return;
                }

                if (!recoveryKey) {
                  setLoginError("⚠️ La clave secreta es obligatoria.");
                  return;
                }

                const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
                if (!passwordRegex.test(newPassword)) {
                  setLoginError("⚠️ Debes ingresar una nueva contraseña válida.");
                  return;
                }

                try {
                  const response = await fetch("http://localhost:8080/auth/recovery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, recoveryKey, newPassword }),
                  });

                  if (response.ok) {
                    setModalConfig({
                      message: "// Contraseña actualizada correctamente",
                      confirmText: "Iniciar sesión",
                      onConfirm: () => setActiveSection("login")
                    });
                  } else {
                    setModalConfig({
                      message: "⚠️ Clave secreta incorrecta. Si la has perdido, no podemos recuperar tu cuenta. Te recomendamos crear una nueva.",
                      confirmText: "Aceptar"
                    });
                  }
                } catch (err) {
                  console.error("Error inesperado en recuperación:", err);
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
                  maxLength="20"
                />
              </label>

              <label>
                Clave secreta
                <input
                  type="password"
                  name="recoveryKey"
                  placeholder="Tu clave secreta"
                  required
                />
              </label>

              <label>
                Nueva contraseña
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Tu nueva contraseña"
                  required
                  minLength="8"
                />
              </label>

              <span className="hint">
                Debe contener al menos una letra mayúscula, un número y un carácter especial.
              </span>

              <button type="submit">Recuperar contraseña</button>
              {loginError && <span className="error-msg">{loginError}</span>}
            </form>
          </div>
        )}

        {/* 🔘 REGISTRO */}
        {activeSection === 'register' && (
          <div className="info-box">
            <form
              className="form-box"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.username.value.trim();
                const password = e.target.password.value.trim();
                const recoveryKey = e.target.recoveryKey.value.trim();

                setRegisterError("");

                if (username.length < 4) {
                  setRegisterError("⚠️ El nombre de usuario debe tener al menos 4 caracteres.");
                  return;
                }

                const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
                if (!passwordRegex.test(password)) {
                  setRegisterError("⚠️ La contraseña debe tener mayúsculas, números y un carácter especial.");
                  return;
                }

                if (!passwordRegex.test(recoveryKey)) {
                  setRegisterError("⚠️ La clave secreta debe tener mayúsculas, números y un carácter especial.");
                  return;
                }

                try {
                  const response = await fetch('http://localhost:8080/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, recoveryKey }),
                  });

                  if (response.ok) {
                    const blob = new Blob(
                      [`Este archivo contiene tu clave secreta de recuperación.\nGuárdalo en un lugar seguro.\nSi la pierdes, no podrás recuperar tu cuenta.\nCLAVE SECRETA: ${recoveryKey}`],
                      { type: 'text/plain;charset=utf-8' }
                    );
                    const url = URL.createObjectURL(blob);

                    setModalConfig({
                      message: `// Usuario registrado correctamente.\n\n⚠️ Esta es tu única oportunidad para guardar la clave secreta.`,
                      confirmText: "Descargar clave secreta",
                      onConfirm: () => {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `almita_virtual_clave_secreta.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setActiveSection('login');
                      }
                    });
                  } else {
                    const errorJson = await response.json();
                    setModalConfig({
                      message: `// Error: ${errorJson.message || 'Error desconocido'}`,
                      confirmText: "Aceptar"
                    });
                  }
                } catch (err) {
                  alert('// Error de red: ' + err.message);
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
                  placeholder="Tu contraseña"
                  required
                  minLength="8"
                />
              </label>

              <span className="hint">
                Debe contener al menos una letra mayúscula, un número y un carácter especial.
              </span>

              <label>
                Clave secreta
                <input
                  type="password"
                  name="recoveryKey"
                  placeholder="Para recuperar contraseña"
                  required
                  minLength="8"
                />
              </label>

              <span className="hint">
                Debe cumplir los mismos requisitos que la contraseña.
              </span>

              <button type="submit">Registrarse</button>
              {registerError && <span className="error-msg">{registerError}</span>}
            </form>
          </div>
        )}

        {/* 🔘 BOTÓN HOLA (animación Almita) */}
        {activeSection === 'hola' && (
          <div className="info-box almita-box">
            <AlmitaDisplay status="IDLE" color="BLUE" />
          </div>
        )}
      </div>

      {modalConfig && (
        <ModalBase
          message={modalConfig.message}
          onConfirm={() => {
            setModalConfig(null);
            modalConfig.onConfirm?.();
          }}
          onCancel={modalConfig.onCancel ? () => {
            setModalConfig(null);
            modalConfig.onCancel?.();
          } : null}
          confirmText={modalConfig.confirmText || "Aceptar"}
          cancelText={modalConfig.cancelText}
        />
      )}

      {showLogoutModal && (
        <ModalBase
          message="// ¿Deseas cerrar sesión?"
          confirmText="Cerrar sesión"
          cancelText="Cancelar"
          onConfirm={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </section>
  );
};

export default Welcome;
