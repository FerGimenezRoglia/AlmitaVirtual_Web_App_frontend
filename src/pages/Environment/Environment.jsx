import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import screenImage from "../../assets/images/screen.svg";
import keyboardImage from "../../assets/images/keyboard.svg";
import './Environment.css';
import ModalBase from '../../components/atoms/ModalBase';

const Environment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [env, setEnv] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [showCopyLinkModal, setShowCopyLinkModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const [showMonitorPopup, setShowMonitorPopup] = useState(false);
  const [monitorPopupText, setMonitorPopupText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isInterestPopup, setIsInterestPopup] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const interestPhrases = [
    '"Este gesto ya significa mucho. Gracias, de verdad."',
    '"Tu interés no pasa desapercibido. Gracias por estar."',
    '“Una linda señal para mi. Gracias, me motiva."',
    '"Hay interacciones que inspiran. Esta fue una. Gracias por eso.”',
    'Abrazo de Almita. !Muchas gracias!',
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
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

  // Carga del entorno según token o como visitante
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserRole(tokenData.role); // Guardamos el rol en el estado
          setUsername(tokenData.sub); // Guardamos el nombre del usuario logueado
          console.log("// TOKEN DATA:", tokenData);
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
          console.log("// Llamando a entorno público...");
          response = await fetch(`http://localhost:8080/public/environments/${id}`);
        }

        if (response.ok) {
          const data = await response.json();
          setEnv(data);
          // ✅ En modo visitante, tomar el nombre del entorno si viene
          if (!token && data.username) {
            setUsername(data.username);
          }
        } else {
          throw new Error("Error al cargar entorno");
        }

      } catch (err) {
        console.error("// Error al cargar entorno:", err);
        alert("// Error al cargar el entorno");
      }
    };

    fetchEnv();
  }, [id]);

  // Cambiar frase cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => {
        const nextIndex = (prev + 1) % interestPhrases.length;
        setPopupText(interestPhrases[nextIndex]);
        setIsInterestPopup(true);
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          setIsInterestPopup(false);
        }, 5000);

        return nextIndex;
      });
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // ☑️ Función que verifica si el usuario tiene permisos para acciones especiales 
  const hasPermission = () => {
    return userRole === "ROLE_ADMIN" || userRole === "ROLE_USER";
  };

  // ☑️ Función que maneja la subida de archivo 
  const handleUploadFile = () => {
    if (!hasPermission()) {
      setMonitorPopupText("⚠️ No puedes Subir archivos.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ☑️ Función que maneja el cambio de archivo seleccionado 
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      console.log("⚠️ No se seleccionó ningún archivo.");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setPopupText("⚠️ Solo se permiten archivos PDF, JPG o PNG.");
      setShowPopup(true);
      return;
    }

    // Validar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPopupText("⚠️ El archivo debe pesar menos de 5MB.");
      setShowPopup(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/environments/${id}/file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedEnv = await response.json();
        setEnv(updatedEnv);
        setPopupText("// Archivo subido correctamente.");
      } else {
        const errorText = await response.text();
        setPopupText(`Error al registrar archivo: ${errorText}`);
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 10000);
    } catch (error) {
      console.error("Error inesperado al subir archivo:", error);
      setPopupText("Error inesperado. Inténtalo más tarde.");
      setShowPopup(true);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ☑️ Función que maneja el clic en el botón "Eliminar" 
  const handleDeleteFileClick = () => {
    if (!hasPermission()) {
      setMonitorPopupText("⚠️ No puedes eliminar archivos.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
      return;
    }

    if (!env.url) {
      setMonitorPopupText("⚠️ No hay archivo para eliminar.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
      return;
    }

    // Si tiene permiso y hay archivo, preguntamos confirmación
    setShowDeleteConfirm(true);
  };

  // ☑️ Función que elimina el archivo del entorno 
  const handleConfirmDeleteFile = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8080/environments/${id}/file`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedEnv = await response.json();
        setEnv(updatedEnv);
        setPopupText("// Archivo eliminado correctamente.");
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 10000);
      } else {
        const errorText = await response.text();
        setPopupText(`Error al eliminar archivo: ${errorText}`);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar archivo:", error);
      setPopupText("Error inesperado. Inténtalo más tarde.");
      setShowPopup(true);
    } finally {
      setShowDeleteConfirm(false); // Cerramos confirmación siempre
    }
  };

  // ☑️ Función para visualizar el archivo (imagen o PDF)
  const handleViewFileClick = async () => {
    // Si no hay URL, se avisa al usuario
    if (!env.url) {
      setMonitorPopupText("⚠️ No hay archivo para visualizar.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
      return;
    }

    try {
      // Petición al backend para obtener la URL del archivo
      const response = await fetch(`http://localhost:8080/public/environments/${id}/file`);
      if (response.ok) {
        const url = await response.text();
        setFileUrl(url);              // Guardamos la URL para mostrar en modal
        setShowFileViewer(true);      // Activamos el modal visor

        // Petición secundaria: refrescamos el entorno para actualizar estado
        const envResponse = await fetch(`http://localhost:8080/public/environments/${id}`);
        if (envResponse.ok) {
          const updatedEnv = await envResponse.json();
          setEnv(updatedEnv);
        }

      } else {
        // Si falla la carga
        setPopupText("Error al cargar el archivo.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error al visualizar archivo:", error);
      setPopupText("Error inesperado. Inténtalo más tarde.");
      setShowPopup(true);
    }
  };

  // ☑️ Función que descargar el archivo del entorno 
  const handleDownloadFileClick = async () => {
    if (!env?.url) {
      setMonitorPopupText("⚠️ No hay archivo para descargar.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
      return;
    }

    try {
      const url = env.url;
      const extension = url.split('.').pop().toLowerCase();
      const isImage = extension === 'jpg' || extension === 'jpeg' || extension === 'png';

      if (isImage) {
        // Descargar imagen como archivo directamente
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `archivo_${username || 'user'}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);

        setMonitorPopupText("// Imagen descargada correctamente.");
        setShowMonitorPopup(true);
        setTimeout(() => setShowMonitorPopup(false), 10000);
      } else {
        // PDF: abrir en una pestaña nueva
        window.open(url, '_blank');
      }

    } catch (error) {
      console.error("Error al descargar archivo:", error);
      setMonitorPopupText("Error al descargar.");
      setShowMonitorPopup(true);
      setTimeout(() => setShowMonitorPopup(false), 10000);
    }
  };

  // ☑️ Función que maneja el click en "Me Interesa"
  const handleInterestClick = async () => {
    try {
      const response = await fetch(`http://localhost:8080/public/environments/${id}/status`, {
        method: "PATCH",
      });

      if (response.ok) {
        const updatedEnv = await response.json();
        setEnv(updatedEnv);

        // Mostrar frase correspondiente
        setPopupText(interestPhrases[phraseIndex]);
        setIsInterestPopup(true); // Activamos modo “sin botón”
        setShowPopup(true);
        // Ocultar después de 5 segundos
        setTimeout(() => {
          setShowPopup(false);
          setIsInterestPopup(false); // Limpiamos la bandera
        }, 5000);

      } else {
        setPopupText("// Error al registrar tu interés.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 10000);
      }
    } catch (error) {
      console.error("// Error inesperado:", error);
      setPopupText("// Error inesperado. Inténtalo más tarde.");
      setShowPopup(true);
    }
  };

  if (!env) return <p style={{ color: 'white', padding: '2rem' }}>Cargando entorno...</p>;

  return (
    <section className="profile-wrapper">
      {/* 🔘 LADO IZQUIERDO */}
      <div className="left-side">
        <div className="left-wrapper">

          {/* Cuadrante visual */}
          <div className="cuadrante-wrapper">
            <div className="cuadrante-fijo">
              <AlmitaDisplay status={env.status} color={env.color} />
            </div>
          </div>

          {/* Título del usuario */}
          <p className="user-title">/ {username}</p>

          {/* Título del entorno */}
          <p className="env-title">{env.title?.toUpperCase()}</p>

          {/* Descripción del entorno */}
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

      {/* 🔘 LADO DERECHO */}
      <div className="right-side">
        <div className="tech-block-wrapper">

          {/* Monitor */}
          <div className={`screen-wrapper ${showFileViewer ? 'no-transform' : ''}`}>
            <img src={screenImage} alt="Monitor SVG" className="monitor-svg" />

            {/* Contenedor del texto del monitor */}
            <div className="monitor-text-wrapper">
              <div className="monitor-text">
                {(env.status === "ACTIVE" || env.status === "EXCITED" || env.status === "INSPIRED") ? (
                  <>
                    <span style={{ fontSize: "1.1rem", color: "#aaa8a1" }}>
                      file = <span style={{ color: getMonitorTextColor(env.color) }}>true</span>;
                    </span>
                    <br />
                    <span style={{ color: "#aaa8a1" }}>onLoad = () -&gt;</span>
                    <br />
                    <span style={{ color: "#aaa8a1" }}>&#123;</span>
                    <span style={{ color: "#626262" }}>/* ready */</span>
                    <span style={{ color: "#aaa8a1" }}>&#125;;</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "1.1rem", color: "#aaa8a1" }}>
                      file = <span style={{ color: getMonitorTextColor(env.color) }}>false</span>;
                    </span>
                    <br />
                    <span style={{ color: "#aaa8a1" }}>onLoad = () -&gt;</span>
                    <br />
                    <span style={{ color: "#aaa8a1" }}>&#123;</span>
                    <span style={{ color: "#626262" }}>/* upload */</span>
                    <span style={{ color: "#aaa8a1" }}>&#125;;</span>
                  </>
                )}
              </div>
            </div>

            {/* Popup nuevo dentro del monitor */}
            {showPopup && (
              <div className="popup-inside-monitor">
                <p className="popup-content">{popupText}</p>
                {!isInterestPopup && (
                  <button
                    className="popup-content-button"
                    onClick={() => setShowPopup(false)}
                  >
                    Aceptar
                  </button>
                )}
              </div>
            )}
            {/* Popup para errores de visitante sin permisos */}
            {showMonitorPopup && (
              <div className="popup-inside-monitor">
                <p className="popup-content">{monitorPopupText}</p>
                <button
                  className="popup-content-button"
                  onClick={() => setShowMonitorPopup(false)}
                >
                  Aceptar
                </button>
              </div>
            )}
            {/* Popup para confirmar eliminar archivo */}
            {showDeleteConfirm && (
              <div className="popup-inside-monitor">
                <p className="popup-content">¿Deseas Eliminar el Archivo?</p>
                <div className="popup-button-row">
                  <button
                    className="popup-content-button popup-content-button-red"
                    onClick={handleConfirmDeleteFile}
                  >
                    Eliminar
                  </button>
                  <button
                    className="popup-content-button"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {/* Popup para el visor del archivo */}
            {showFileViewer && (
              <div className="custom-modal">
                <div className="custom-modal-content file-viewer-modal">
                  {fileUrl.endsWith(".pdf") ? (
                    <object
                      data={fileUrl}
                      type="application/pdf"
                      className="file-viewer-iframe"
                    />
                  ) : (
                    <img src={fileUrl} alt="Archivo" className="file-viewer-img" />
                  )}
                  <div className="custom-modal-buttons">
                    <button onClick={() => setShowFileViewer(false)}>Cerrar</button>
                  </div>
                </div>
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
                onClick={handleUploadFile}
              >
                Subir Archivo
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={handleFileChange}
                />
              </button>
              <button
                className="keyboard-btn"
                id="btn-delete"
                onClick={handleDeleteFileClick}
              >
                Eliminar
              </button>
              <button className="keyboard-btn" id="btn-enter">Ver</button>
              <button
                className="keyboard-btn"
                id="btn-settings-top"
                onClick={handleInterestClick}
              >
                Me Interesa
              </button>
              <button
                className="keyboard-btn"
                id="btn-settings-bottom"
                onClick={handleInterestClick}
              >
                Me Interesa
              </button>
              <button
                className="keyboard-btn"
                id="btn-enter"
                onClick={handleViewFileClick}
              >
                Ver
              </button>
              <button
                className="keyboard-btn"
                id="btn-help"
                onClick={handleDownloadFileClick}
              >
                Descargar
              </button>

            </div>
          </div>

        </div>
      </div>

      {showUnauthorizedModal && (
        <ModalBase
          message="⚠️ No tienes permisos para editar este entorno."
          onConfirm={() => setShowUnauthorizedModal(false)}
          confirmText="Aceptar"
          cancelText=""
        />
      )}

      {showCopyLinkModal && (
        <ModalBase
          message="// Copiado. Enlace listo para compartir."
          onConfirm={() => setShowCopyLinkModal(false)}
          confirmText="Aceptar"
          cancelText=""
        />
      )}

    </section>
  );
};
export default Environment;
