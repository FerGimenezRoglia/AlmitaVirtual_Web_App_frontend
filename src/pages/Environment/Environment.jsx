import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import screenImage from "../../assets/images/screen.svg";
import keyboardImage from "../../assets/images/keyboard.svg";
import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import './Environment.css';

const Environment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [env, setEnv] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [showCopyLinkModal, setShowCopyLinkModal] = useState(false);
  // 🎯 Estado para guardar el archivo seleccionado
  const [selectedFile, setSelectedFile] = useState(null); // 🎾
  const [showPopup, setShowPopup] = useState(false); // 🎾
  const [popupText, setPopupText] = useState(''); // 🎾

  // 🎨 Devuelve el color del texto del monitor según el entorno
  const getMonitorTextColor = () => {
    switch (env.color) {
      case "GREEN":
        return "#88BA74";
      case "RED":
        return "#D17D84";
      case "BLUE":
        return "#586ADB";
      case "YELLOW":
        return "#E0D08D";
      case "NEUTRAL":
        return "#AAA8A1";
      default:
        return "#ffffff"; // Blanco por defecto
    }
  };

  // 🧠 Carga del entorno según token o como visitante
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserRole(tokenData.role); // Guardamos el rol en el estado
          setUsername(tokenData.sub); // Guardamos el nombre del usuario logueado
          console.log("🔍 TOKEN DATA:", tokenData);
        }

        let response;
        if (token) {
          console.log("🔐 Llamando a entorno con token...");
          response = await fetch(`http://localhost:8080/environments/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          console.log("🌐 Llamando a entorno público...");
          response = await fetch(`http://localhost:8080/public/environments/${id}`);
        }

        if (response.ok) {
          const data = await response.json();
          setEnv(data);
        } else {
          throw new Error("Error al cargar entorno");
        }
      } catch (err) {
        console.error("❌ Error al cargar entorno:", err);
        alert("❌ Error al cargar el entorno");
      }
    };

    fetchEnv();
  }, [id]);

  if (!env) return <p style={{ color: 'white', padding: '2rem' }}>Cargando entorno...</p>;

  return (
    <section className="profile-wrapper">
      {/* 🔹 LADO IZQUIERDO */}
      <div className="left-side">
        <div className="left-wrapper">

          {/* 🖼️ Cuadrante visual */}
          <div className="cuadrante-wrapper">
            <div className="cuadrante-fijo">
              <AlmitaDisplay status={env.status} color={env.color} />
            </div>
          </div>

          {/* 👤 Título del usuario */}
          <p className="user-title">/ {username || "USUARIO"}</p>

          {/* 📝 Título del entorno */}
          <p className="env-title">{env.title?.toUpperCase()}</p>

          {/* 🧾 Descripción del entorno */}
          <div className="description-container">
            <p className="description-text">
              {env.description}
            </p>
          </div>

          <div className="environment-options-tight">
            <span className="menu-item" onClick={() => setShowOptions(!showOptions)}>
              ENTORNO&nbsp;_
            </span>

            {showOptions && (
              <>
                <span className="sub-item" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowCopyLinkModal(true);
                }}>
                  &nbsp;COPIAR LINK&nbsp;_
                </span>

                <span className="sub-item" onClick={() => {
                  if (userRole === "ROLE_ADMIN" || userRole === "ROLE_USER") {
                    navigate(userRole === "ROLE_ADMIN" ? "/admin" : "/profile");
                  } else {
                    setShowUnauthorizedModal(true);
                  }
                }}>
                  &nbsp;EDITAR&nbsp;_
                </span>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 🔹 LADO DERECHO */}
      <div className="right-side">
        <div className="tech-block-wrapper">

          {/* Monitor */}
          <div className="screen-wrapper">
            <img src={screenImage} alt="Monitor SVG" className="monitor-svg" />

            {/* Contenedor del texto del monitor */}
            <div className="monitor-text-wrapper">
              <div className="monitor-text" style={{ color: getMonitorTextColor(env.color) }}>
                {(env.status === "ACTIVE" || env.status === "EXCITED" || env.status === "INSPIRED")
                  ? "SI / Archivo _"
                  : "NO / Archivo _"}
              </div>
            </div>

            {/* Popup si corresponde */}
            {showPopup && (
              <div className="popup-overlay">
                <p>{popupText}</p>
                <button onClick={() => setShowPopup(false)}>Aceptar</button>
              </div>
            )}
          </div>

          {/* Teclado */}
          <div className="keyboard-wrapper">
            <img src={keyboardImage} alt="Keyboard SVG" className="keyboard-svg" />

            <div className="keyboard-buttons-container">
              <button
                className="keyboard-btn"
                id="btn-upload"
              >
                Subir Archivo
              </button>
              <button className="keyboard-btn" id="btn-delete">Eliminar</button>
              <button className="keyboard-btn" id="btn-enter">Ver</button>
              <button className="keyboard-btn" id="btn-settings-top">Me Interesa</button>
              <button className="keyboard-btn" id="btn-settings-bottom">Me Interesa</button>
              <button className="keyboard-btn" id="btn-help">Descargar</button>

              {/* 📄 Input invisible 🎾 */}
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                accept=".pdf, .jpg, .jpeg, .png"
              />
            </div>
          </div>

        </div>
      </div>

      {showUnauthorizedModal && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <p>⚠️ No tienes permisos para editar este entorno.</p>
            <div className="custom-modal-buttons">
              <button onClick={() => setShowUnauthorizedModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showCopyLinkModal && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <p>🔗 Copiado. Enlace listo para compartir.</p>
            <div className="custom-modal-buttons">
              <button onClick={() => setShowCopyLinkModal(false)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
export default Environment;
