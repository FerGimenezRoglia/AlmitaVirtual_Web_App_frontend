import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlmitaDisplay from '../../components/AlmitaDisplay';
import './Environment.css';

const Environment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [env, setEnv] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');

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
                  alert("🔗 Enlace copiado al portapapeles");
                }}>
                  &nbsp;COPIAR LINK&nbsp;_
                </span>

                <span className="sub-item" onClick={() => {
                  if (userRole === "ROLE_ADMIN") {
                    navigate("/admin");
                  } else {
                    navigate("/profile");
                  }
                }}>
                  &nbsp;EDITAR&nbsp;_
                </span>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 🔸 LADO DERECHO (sin cambios por ahora) */}
      <div className="right-side">
        <div className="info-box">
          <p className="info-text">COLOR: {env.color}</p>
          <p className="info-text">ESTADO ACTUAL: {env.status}</p>
          <p className="info-text">
            ARCHIVO: {env.url ? (
              <a href={env.url} target="_blank" rel="noopener noreferrer">Ver archivo</a>
            ) : (
              "Sin archivo aún"
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
export default Environment;
