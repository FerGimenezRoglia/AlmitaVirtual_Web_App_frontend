import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Environment = () => {
  const { id } = useParams();
  const [env, setEnv] = useState(null);

  useEffect(() => {
    const fetchEnv = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/environments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnv(data);
      } else {
        alert('❌ Error al cargar el entorno');
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