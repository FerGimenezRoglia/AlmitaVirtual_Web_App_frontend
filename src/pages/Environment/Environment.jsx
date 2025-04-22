import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Environment.css';

const Environment = () => {
  const { id } = useParams();
  const [env, setEnv] = useState(null);
  const [accessLevel, setAccessLevel] = useState(null); // 🌐 'visitor', 'owner', 'admin', 'unauthorized'


  // 🧠 [CARGA DE ENTORNO] Detecta si el visitante está logueado o no.
  // ✅ Detecta si hay token o no para decidir si llamar como visitante o usuario
  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchEnv = async () => {
      try {
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
          console.log(`Endpoint público: http://localhost:8080/public/environments/${id}`);
          response = await fetch(`http://localhost:8080/public/environments/${id}`);
        }

        if (response.ok) {
          const data = await response.json();
          setEnv(data);

          // 🧠 Determinar tipo de acceso al entorno.
          // Este bloque analiza si el visitante es el dueño, un admin o un visitante público
          if (token) {
            const tokenData = JSON.parse(atob(token.split('.')[1])); // Decodificamos el JWT
            const currentUserId = tokenData.id;
            const currentUserRole = tokenData.role;

            if (currentUserRole === "ROLE_ADMIN") {
              setAccessLevel("admin"); // 👑 Admin: puede hacer todo
            } else if (data.userId === currentUserId) {
              setAccessLevel("owner"); // 👤 Dueño: puede gestionar su propio entorno
            } else {
              setAccessLevel("unauthorized"); // ❌ Token inválido para este entorno (por seguridad)
            }

            console.log("🧪 Nivel de acceso detectado:", currentUserRole);
          } else {
            setAccessLevel("visitor"); // 🌐 Visitante público
            console.log("🧪 Nivel de acceso detectado: visitor");
          }

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

  if (!env) return <p>Cargando...</p>;

  // 🌟 Devuelve una imagen según el estado
  const renderStateImage = (status) => {
    const statusImages = {
      IDLE: "https://res.cloudinary.com/dwk4mvgtp/image/upload/v1745100072/kemhyfrss9gqluvtxiju.png",
      ACTIVE: "https://res.cloudinary.com/demo/video/upload/v1616519750/active_sample.jpg",
      REFLECTIVE: "https://res.cloudinary.com/demo/video/upload/v1616519750/reflective_sample.jpg",
      EXITED: "https://res.cloudinary.com/demo/video/upload/v1616519750/exited_sample.jpg",
      INSPIRED: "https://res.cloudinary.com/demo/video/upload/v1616519750/inspired_sample.jpg",
    };

    return (
      <img
        src={statusImages[status] || statusImages["IDLE"]}
        alt={`Estado ${status}`}
        className="almita-image"
      />
    );
  };

  return (
    <section className="profile-wrapper">
      {/* IZQUIERDA - IMAGEN DEL ESTADO */}
      <div className="left-side">
        <div className="video-container">
          <img
            src="https://res.cloudinary.com/dwk4mvgtp/image/upload/v1745100072/kemhyfrss9gqluvtxiju.png"
            alt="Estado visual"
            className="almita-image"
          />
        </div>

        <div className="title-block">
          <p className="title">/ ENTORNO</p>
        </div>
        <div className="description-block">
          <p className="description">{env.title.toUpperCase()}</p>
        </div>

      </div>

      {/* DERECHA - FUTURA INTERFAZ */}
      <div className="right-side">
        <div className="info-box">
          <p className="info-text">Descripción: {env.description}</p>
          <p className="info-text">Color: {env.color}</p>
          <p className="info-text">Estado actual: {env.status}</p>
          <p className="info-text">
            Archivo:{" "}
            {env.url ? (
              <a href={env.url} target="_blank" rel="noopener noreferrer">
                Ver archivo
              </a>
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