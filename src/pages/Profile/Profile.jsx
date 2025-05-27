import React, { useState, useEffect } from 'react';
import './Profile.css';
import Button from '../../components/atoms/Button';
import { useNavigate } from 'react-router-dom';
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

    // Extraemos datos del formulario
    const title = e.target.title.value.trim();
    const description = e.target.description.value;
    const color = e.target.color.value;
    const file = e.target.file.files[0];

    // Validación del archivo antes de continuar
    if (file && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setCreateError("⚠️ Solo se permiten PDF o imágenes JPG/PNG.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setCreateError("⚠️ El archivo debe pesar menos de 5MB.");
      return;
    }

    if (!title) {
      setCreateError("⚠️ El título es obligatorio!");
      return;
    }

    setCreateError(""); // limpiamos error si pasa validación

    try {
      // 1. Enviar solo los datos básicos como JSON
      const response = await fetch("http://localhost:8080/environments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          color,
          url: "", // se completará después si sube archivo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Error al crear entorno: " + errorText);
        return;
      }

      const createdEnv = await response.json();

      // 2. Si el usuario subió un archivo, lo enviamos ahora
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(
          `http://localhost:8080/environments/${createdEnv.id}/file`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          alert("Error al subir el archivo: " + errorText);
          return;
        }
      }

      // Navegamos al entorno creado
      navigate(`/environment/${createdEnv.id}`);
    } catch (err) {
      alert("Error inesperado: " + err.message);
    }
  };

  // ☑️ Maneja la actualización de un entorno existente
  const handleUpdateEnvironment = async (e) => {
    e.preventDefault();

    setEditError(""); // Limpiamos errores

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    // Validación
    if (!editFormData.title.trim()) {
      setEditError("⚠️ El título es obligatorio!");
      return;
    }

    // Validación del archivo antes de subir
    const file = editFormData.file;
    if (file && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setEditError("⚠️ Solo se permiten PDF o imágenes JPG/PNG.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setEditError("⚠️ El archivo debe pesar menos de 5MB.");
      return;
    }

    try {
      // 1. Actualizamos los datos básicos
      const baseUpdate = {
        title: editFormData.title,
        description: editFormData.description,
        color: editFormData.color,
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
        alert("Error al actualizar entorno: " + errorText);
        return;
      }

      // 2. Si se seleccionó un nuevo archivo, lo subimos
      if (editFormData.file) {
        const formData = new FormData();
        formData.append("file", editFormData.file);

        const uploadResponse = await fetch(
          `http://localhost:8080/environments/${selectedEnvId}/file`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          alert("Archivo no se pudo subir: " + errorText);
          return;
        }
      }

      // 3. Redirigir al entorno actualizado
      navigate(`/environment/${selectedEnvId}`);
    } catch (err) {
      alert("Error inesperado: " + err.message);
    }
  };

  // ☑️ Maneja la eliminación de un entorno
  const handleDeleteEnvironment = async (envId) => {

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
