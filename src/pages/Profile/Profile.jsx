import React, { useState, useEffect } from 'react';
import './Profile.css';
import Button from '../../components/atoms/Button';
import { useNavigate } from 'react-router-dom';
import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import { getUsernameFromToken } from '../../utils/jwtUtils';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import ModalBase from '../../components/atoms/ModalBase';



const Profile = () => {
  const [activeSection, setActiveSection] = useState(null);
  const token = localStorage.getItem('token');
  const username = getUsernameFromToken(token);
  const [userEnvs, setUserEnvs] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    console.log("Confirmado!");
    setShowModal(false);
  };

  const handleCancel = () => {
    console.log("Cancelado");
    setShowModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = token ? JSON.parse(atob(token.split('.')[1])).role : null;
    if (role !== 'ROLE_USER') {
      alert('❌ Acceso denegado. Esta página es solo para usuarios.');
      navigate('/admin');
    }
  }, []);

  const [selectedEnvId, setSelectedEnvId] = useState(null);
  // Estado que cuenta cuántos caracteres lleva la descripción
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    color: 'NEUTRAL',
    url: ''
  });
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  // ID del entorno que está pendiente de confirmación para eliminar
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Carga los entornos del usuario cuando se selecciona la sección 'ver'
  useEffect(() => {
    if (
      (activeSection === 'ver' ||
        activeSection === 'editar' ||
        activeSection === 'eliminar') &&
      userEnvs.length === 0
    ) {
      fetchUserEnvironments();
    }
  }, [activeSection]);

  // Limpiar error cuando se cambia de sección
  useEffect(() => {
    setCreateError("");
  }, [activeSection]);

  // Limpiar error cuando se cambia de sección
  useEffect(() => {
    setEditError("");
  }, [activeSection]);

  // Llama al backend para obtener los entornos del usuario autenticado
  const fetchUserEnvironments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('⚠️ No estás autenticado');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/environments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserEnvs(data);
      } else {
        const errorText = await response.text();
        alert('❌ Error al obtener entornos: ' + errorText);
      }
    } catch (err) {
      alert('❌ Error de red: ' + err.message);
    }
  };

  // ☑️ Maneja la creación de un nuevo entorno
  const handleCreateEnvironment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    // Extraemos todos los valores del formulario
    const title = e.target.title.value;
    const description = e.target.description.value;
    const color = e.target.color.value;
    const file = e.target.file.files[0]; // archivo opcional

    // Validación manual del campo título
    if (!title.trim()) {
      setCreateError("⚠️ El título es obligatorio!");
      return;
    }

    setCreateError(""); // Limpiamos error si pasa la validación

    let fileUrl = ""; // inicializamos el link del archivo vacío

    // Si el usuario cargó un archivo, lo subimos a Cloudinary
    if (file) {
      try {
        const uploadedUrl = await uploadFileToCloudinary(file);
        if (!uploadedUrl) throw new Error("No se obtuvo URL del archivo");
        fileUrl = uploadedUrl;
      } catch (error) {
        alert("// Error al subir el archivo: " + error.message);
        return;
      }
    }

    // Armamos el objeto con todos los campos
    const payload = {
      title,
      description,
      color,
      url: fileUrl // puede ser vacío si no subió archivo
    };

    // Mandamos el entorno al backend
    try {
      const response = await fetch("http://localhost:8080/environments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const data = await response.json();
        // Entorno creado con éxito (mensaje suprimido)

        // Redirigimos al entorno recién creado
        navigate(`/environment/${data.id}`);
      } else {
        const errorText = await response.text();
        alert("// Error al crear entorno: " + errorText);
      }
    } catch (err) {
      alert("// Error de red: " + err.message);
    }
  };

  // ☑️ Maneja la actualización de un entorno existente
  const handleUpdateEnvironment = async (e) => {
    e.preventDefault();

    setEditError(""); // Limpiamos el error si pasa validación

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    // Validación manual del campo título
    if (!editFormData.title.trim()) {
      setEditError("⚠️ El título es obligatorio!");
      return;
    }
    setEditError(""); // Limpiamos error si pasa la validación

    try {
      // 1. Subimos archivo si hay uno nuevo
      let newFileUrl = editFormData.url;
      if (editFormData.file) {
        const uploadedUrl = await uploadFileToCloudinary(editFormData.file);
        if (!uploadedUrl) {
          alert("// Error al subir el archivo");
          return;
        }
        newFileUrl = uploadedUrl;
      }

      // 2. Actualizamos campos básicos (sin archivo aún)
      const baseUpdate = {
        title: editFormData.title,
        description: editFormData.description,
        color: editFormData.color
      };

      const response = await fetch(`http://localhost:8080/environments/${selectedEnvId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(baseUpdate),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("// Error al actualizar entorno: " + errorText);
        return;
      }

      // 3. Si se subió un archivo nuevo, lo registramos en el backend
      if (editFormData.file) {
        const registerFile = await fetch(`http://localhost:8080/environments/${selectedEnvId}/file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: new URLSearchParams({ fileUrl: newFileUrl }),
        });

        if (!registerFile.ok) {
          const errorText = await registerFile.text();
          alert("// Archivo subido pero error al registrar en backend: " + errorText);
          return;
        }
      }

      // Entorno actualizado con éxito (mensaje suprimido)
      navigate(`/environment/${selectedEnvId}`);

    } catch (err) {
      alert("// Error inesperado: " + err.message);
    }
  };

  // ☑️ Maneja la eliminación de un entorno
  const handleDeleteEnvironment = async (envId) => {
    //const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este entorno?");
    //if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/environments/${envId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setConfirmDeleteId(null);
        // alert(" Entorno eliminado correctamente.");
        fetchUserEnvironments(); // Refresca la lista
      } else {
        const errorText = await response.text();
        alert("// Error al eliminar entorno: " + errorText);
      }
    } catch (err) {
      alert("// Error de red: " + err.message);
    }
  };

  return (
    <section className="welcome-wrapper">
      {/* BLOQUE IZQUIERDO */}
      <div className="left-side">
        <div className="title-block">
          <p className="title">/ USUARIO _ {username}</p>
        </div>

        <div className="description-block">
          <p className="description">
            COMO USUARIO, PUEDES CREAR Y GESTIONAR TUS ENTORNOS PERSONALES PARA ALOJAR TU ARCHIVO DIGITAL Y TENERLOS SIEMPRE LISTOS PARA COMPARTIR.
          </p>
        </div>

        <div className="menu-block">
          <div className="grouped-items">
            <p className="menu-item first" onClick={() => setActiveSection('ver')}>VER _</p>
            <p className="menu-item" onClick={() => setActiveSection('crear')}>CREAR _</p>
            <p
              className="menu-item"
              onClick={() => {
                setSelectedEnvId(null);
                setActiveSection('editar');
              }}
            >
              EDITAR _
            </p>
            <p className="menu-item" onClick={() => setActiveSection('eliminar')}>ELIMINAR _</p>
          </div>

          <p className="menu-item estado-item" onClick={() => setActiveSection('estado')}>
            [ALMITA]
          </p>

          <p
            className="menu-item spaced"
            onClick={() => navigate("/")}>
            INICIO.
          </p>
        </div>
      </div>

      {/* BLOQUE DERECHO */}
      <div className="right-side">


        {activeSection === 'ver' && (
          <div className="info-box">
            <p className="info-text">
              TUS ENTORNOS <span className="highlighted-section">/ CREADOS _</span>
            </p>
            <ul className="env-list">
              {userEnvs.map((env) => (
                <li key={env.id} className="env-item" onClick={() => navigate(`/environment/${env.id}`)}>
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'crear' && (
          <div className="info-box">
            <form
              className="form-box"
              onSubmit={handleCreateEnvironment}
            >
              <label>
                Título del Entorno *
                <input type="text" name="title" placeholder="Ej: Currículum Vitae" maxLength="100" />
              </label>

              {createError && (
                <span className="error-msg">{createError}</span>
              )}

              <label>
                Descripción
                <input
                  type="text"
                  name="description"
                  placeholder="Breve descripción"
                  maxLength="300"
                  onChange={(e) => {
                    setDescriptionLength(e.target.value.length);
                  }}
                />
              </label>

              {/* 👉 Contador de caracteres en vivo */}
              {descriptionLength > 0 && (
                <span className="description-counter">
                  {descriptionLength}/300
                  {descriptionLength === 300 && " ⚠️ Máximo de caracteres."}
                </span>
              )}

              <label>
                Color
                <select name="color">
                  <option value="NEUTRAL">Neutral</option>
                  <option value="GREEN">Verde</option>
                  <option value="RED">Rojo</option>
                  <option value="BLUE">Azul</option>
                  <option value="YELLOW">Amarillo</option>
                </select>
              </label>

              <label className="file-upload-label">
                Seleccionar archivo
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-upload-input"
                />
              </label>

              <Button type="submit">Crear Entorno</Button>
            </form>
          </div>
        )}

        {activeSection === 'editar' && (
          <div className="info-box">
            {!selectedEnvId ? (
              <form className="form-box">
                <p className="edit-label">
                  TUS ENTORNOS <span className="highlighted-section">/ EDITAR _</span>
                </p>

                <label>
                  <select
                    className="edit-select"
                    name="environment"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selected = userEnvs.find(env => env.id.toString() === selectedId);
                      setSelectedEnvId(selectedId);
                      setEditFormData({
                        title: selected?.title || '',
                        description: selected?.description || '',
                        color: selected?.color || 'NEUTRAL',
                        url: selected?.url || ''
                      });
                    }}
                  >
                    <option value="">seleccionar _</option>
                    {userEnvs.map(env => (
                      <option key={env.id} value={env.id}>{env.title}</option>
                    ))}
                  </select>
                </label>
              </form>
            ) : (
              <form className="form-box" onSubmit={handleUpdateEnvironment}>
                <label>
                  Título del Entorno *
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    maxLength="100"
                  />
                </label>

                {editError && (
                  <span className="error-msg">{editError}</span>
                )}

                <label>
                  Descripción
                  <input
                    type="text"
                    name="description"
                    maxLength="300"
                    placeholder="Breve descripción"
                    value={editFormData.description}
                    onChange={(e) => {
                      const input = e.target.value;
                      setEditFormData({ ...editFormData, description: input });
                    }}
                  />
                </label>

                <span className="description-counter">
                  {editFormData.description.length}/300
                  {editFormData.description.length === 300 && ' ⚠️ Máximo de caracteres.'}
                </span>

                <label>
                  Color
                  <select
                    name="color"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                  >
                    <option value="NEUTRAL">Neutral</option>
                    <option value="GREEN">Verde</option>
                    <option value="RED">Rojo</option>
                    <option value="BLUE">Azul</option>
                    <option value="YELLOW">Amarillo</option>
                  </select>
                </label>

                <label className="file-upload-label">
                  Seleccionar archivo
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-upload-input"
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, file: e.target.files[0] })
                    }
                  />
                </label>

                <span className="hint">
                  Si subes un archivo, reemplazará al actual (si existe).
                </span>

                <Button type="submit">Actualizar Entorno</Button>
              </form>
            )}
          </div>
        )}

        {activeSection === 'eliminar' && (
          <div className="info-box">
            <p className="info-text">
              TUS ENTORNOS <span className="highlighted-section">/ ELIMINAR _</span>
            </p>
            <ul className="env-list">
              {userEnvs.map((env) => (
                <li
                  key={env.id}
                  className="env-item"
                  onClick={() => setConfirmDeleteId(env.id)}
                >
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 🔘 BOTÓN HOLA (animación Almita) */}
        {activeSection === 'estado' && (
          <div className="info-box">
            <AlmitaDisplay status="EXCITED" color="YELLOW" />
          </div>
        )}

      </div>
      {confirmDeleteId && (
        <ModalBase
          message="¿Estás seguro de que deseas eliminar este entorno?"
          onConfirm={() => handleDeleteEnvironment(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />
      )}

    </section>
  );
};

export default Profile;
