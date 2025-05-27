import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsernameFromToken } from '../../utils/jwtUtils';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import ModalBase from '../../components/atoms/ModalBase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const token = localStorage.getItem('token');
  const username = getUsernameFromToken(token);
  const [userEnvs, setUserEnvs] = useState([]);
  const [allEnvs, setAllEnvs] = useState([]);
  const [selectedEnvId, setSelectedEnvId] = useState(null);
  // Contador para descripción (crear y editar)
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    color: 'NEUTRAL',
    url: ''
  });

  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = token ? JSON.parse(atob(token.split('.')[1])).role : null;
    if (role !== 'ROLE_ADMIN') {
      alert('!! Acceso denegado. Esta página es solo para administradores.');
      navigate('/profile');
    }
  }, []);

  useEffect(() => {
    if (["ver", "editar", "eliminar"].includes(activeSection)) {
      fetchUserEnvironments();
    }
  }, [activeSection]);

  useEffect(() => {
    setCreateError("");
    setEditError("");
  }, [activeSection]);

  const fetchUserEnvironments = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = "1"; // 👑 Por ahora hardcodeado a admin

    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/environments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userEnvs = data.filter((env) => env.userId == currentUserId);
        const otherEnvs = data.filter((env) => env.userId != currentUserId);
        setUserEnvs(userEnvs);
        setAllEnvs(otherEnvs);
      } else {
        const errorText = await response.text();
        alert("❌ Error al obtener entornos: " + errorText);
      }
    } catch (err) {
      alert("❌ Error de red: " + err.message);
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

    const title = e.target.title.value;
    const description = e.target.description.value;
    const color = e.target.color.value;
    const file = e.target.file.files[0];

    if (!title.trim()) {
      setCreateError("⚠️ El título es obligatorio!");
      return;
    }

    if (file && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setCreateError("⚠️ Solo se permiten PDF o imágenes JPG/PNG.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setCreateError("⚠️ El archivo debe pesar menos de 5MB.");
      return;
    }

    try {
      const payload = {
        title,
        description,
        color,
        url: "" // Primero vacío, se actualiza luego si hay archivo
      };

      const response = await fetch("http://localhost:8080/environments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const created = await response.json();

        if (file) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadResponse = await fetch(
            `http://localhost:8080/environments/${created.id}/file`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            const err = await uploadResponse.text();
            alert("⚠️ Archivo no subido: " + err);
          }
        }

        navigate(`/environment/${created.id}`);
      } else {
        const errorText = await response.text();
        alert("Error al crear entorno: " + errorText);
      }
    } catch (err) {
      alert("Error de red: " + err.message);
    }
  };

  // ☑️ Maneja la actualización de un entorno existente
  const handleUpdateEnvironment = async (e) => {
    e.preventDefault();
    setEditError("");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No estás autenticado");
      return;
    }

    if (!editFormData.title.trim()) {
      setEditError("⚠️ El título es obligatorio!");
      return;
    }

    if (editFormData.file) {
      if (!["application/pdf", "image/jpeg", "image/png"].includes(editFormData.file.type)) {
        setEditError("⚠️ Solo se permiten PDF o imágenes JPG/PNG.");
        return;
      }
      if (editFormData.file.size > 5 * 1024 * 1024) {
        setEditError("⚠️ El archivo debe pesar menos de 5MB.");
        return;
      }
    }

    try {
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
        alert("❌ Error al actualizar entorno: " + errorText);
        return;
      }

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
          alert("❌ Archivo subido pero error al registrar en backend: " + errorText);
          return;
        }
      }

      navigate(`/environment/${selectedEnvId}`);
    } catch (err) {
      alert("❌ Error inesperado: " + err.message);
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
        //alert("🗑️ Entorno eliminado correctamente.");
        setConfirmDeleteId(null);
        fetchUserEnvironments(); // 🔁 Refresca lista
      } else {
        const errorText = await response.text();
        alert("❌ Error al eliminar entorno: " + errorText);
      }
    } catch (err) {
      alert("❌ Error de red: " + err.message);
    }
  };

  return (
    <section className="welcome-wrapper">
      {/* LADO IZQUIERDO */}
      <div className="left-side">
        <div className="title-block">
          <p className="title">/ ADMIN _ {username}</p>
        </div>

        <div className="description-block">
          <p className="description">
            COMO ADMINISTRADOR, PUEDES ACCEDER Y GESTIONAR TODOS LOS ENTORNOS CREADOS POR LOS USUARIOS, ASEGURANDO SU CORRECTO FUNCIONAMIENTO.
          </p>
        </div>

        <div className="menu-block">
          <div className="grouped-items">
            <p className="menu-item first" onClick={() => setActiveSection("ver")}>VER _</p>
            <p className="menu-item" onClick={() => setActiveSection("crear")}>CREAR _</p>
            <p className="menu-item" onClick={() => { setSelectedEnvId(null); setActiveSection("editar"); }}>EDITAR _</p>
            <p className="menu-item" onClick={() => setActiveSection("eliminar")}>ELIMINAR _</p>
          </div>

          <p className="menu-item estado-item" onClick={() => setActiveSection("estado")}>[ALMITA]</p>

          <p className="menu-item spaced" onClick={() => navigate("/")}>INICIO.</p>
        </div>
      </div>

      {/* LADO DERECHO */}
      <div className="right-side">

        {activeSection === "ver" && (
          <div className="info-box">
            <p className="info-text">
              TUS ENTORNOS <span className="highlighted-section">/ ADMIN _</span>
            </p>
            <ul className="env-list">
              {userEnvs.map((env) => (
                <li key={env.id} className="env-item" onClick={() => navigate(`/environment/${env.id}`)}>
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>

            <p className="info-text">
              LOS ENTORNOS <span className="highlighted-section">/ USUARIOS _</span>
            </p>
            <ul className="env-list">
              {allEnvs.map((env) => (
                <li key={env.id} className="env-item" onClick={() => navigate(`/environment/${env.id}`)}>
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'crear' && (
          <div className="info-box">
            <form className="form-box" onSubmit={handleCreateEnvironment}>
              <label>
                Título del Entorno *
                <input type="text" name="title" placeholder="Ej: Currículum Vitae" maxLength="100" />
              </label>

              {createError && <span className="error-msg">{createError}</span>}

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

              {/* Contador de caracteres en vivo */}
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

              <button type="submit">Crear Entorno</button>
            </form>
          </div>
        )}

        {activeSection === 'editar' && (
          <div className="info-box">
            {!selectedEnvId ? (
              <form className="form-box">
                <p className="edit-label">
                  TODOS LOS ENTORNOS <span className="highlighted-section">/ EDITAR _</span>
                </p>

                <select
                  className="edit-select"
                  name="environment"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selected = [...userEnvs, ...allEnvs].find(env => env.id.toString() === selectedId);
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
                  <optgroup label="/ ADMIN _">
                    {userEnvs.map(env => (
                      <option key={env.id} value={env.id}>{env.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="/ USUARIOS _">
                    {allEnvs.map(env => (
                      <option key={env.id} value={env.id}>{env.title}</option>
                    ))}
                  </optgroup>
                </select>
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
                    placeholder="Breve descripción"
                    maxLength="300"
                    value={editFormData.description}
                    onChange={(e) => {
                      const input = e.target.value;
                      setEditFormData({ ...editFormData, description: input });
                      setDescriptionLength(input.length);
                    }}
                  />
                </label>

                {/* Contador de caracteres en vivo */}
                {descriptionLength > 0 && (
                  <span className="description-counter">
                    {descriptionLength}/300
                    {descriptionLength === 300 && " ⚠️ Máximo de caracteres."}
                  </span>
                )}

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

                <button type="submit">Actualizar Entorno</button>
              </form>
            )}
          </div>
        )}

        {activeSection === 'eliminar' && (
          <div className="info-box">
            <p className="info-text">
              TUS ENTORNOS <span className="highlighted-section">/ ADMIN _</span>
            </p>
            <ul className="env-list">
              {userEnvs.map((env) => (
                <li
                  key={env.id}
                  className="env-item"
                  onClick={() => {
                    setConfirmDeleteId(env.id);
                    setShowModal(true);
                  }}
                >
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>

            <p className="info-text">
              LOS ENTORNOS <span className="highlighted-section">/ USUARIOS _</span>
            </p>
            <ul className="env-list">
              {allEnvs.map((env) => (
                <li
                  key={env.id}
                  className="env-item"
                  onClick={() => {
                    setConfirmDeleteId(env.id);
                    setShowModal(true);
                  }}
                >
                  <span className="env-dot">•</span> {env.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🔘 BOTÓN ESTADO (animación Almita) */}
        {activeSection === 'estado' && (
          <div className="info-box">
            <AlmitaDisplay status="ACTIVE" color="BLUE" />
          </div>
        )}

      </div>
      {confirmDeleteId && showModal && (
        <ModalBase
          message="¿Estás seguro de que deseas eliminar este entorno?"
          onConfirm={() => handleDeleteEnvironment(confirmDeleteId)}
          onCancel={() => {
            setShowModal(false);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
