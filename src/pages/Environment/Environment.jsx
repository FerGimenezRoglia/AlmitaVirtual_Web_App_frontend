import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{env.title}</h1>
      <p><strong>Descripción:</strong> {env.description}</p>
      <p><strong>Color:</strong> {env.color}</p>
      <p><strong>Estado:</strong> {env.status}</p>
      <p><strong>Archivo:</strong> <a href={env.url} target="_blank" rel="noopener noreferrer">{env.url}</a></p>
    </div>
  );
};

export default Environment;