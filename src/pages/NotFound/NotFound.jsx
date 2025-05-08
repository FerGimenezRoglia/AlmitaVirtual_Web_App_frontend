import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Nuevo archivo para centralizar estilos

const NotFound = () => {
  return (
    <section className="notfound-wrapper">
      <div className="notfound-content">

        {/* Imagen central, cuadrada */}
        <div className="notfound-image">
          <video
            src="/assets/404.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="notfound-video"
          />
        </div>

        {/* Texto principal */}
        <h1 className="notfound-title">¡Oops! Página no encontrada</h1>
        <p className="notfound-subtext">
          La ruta que buscás no existe o fue movida.
        </p>

        {/* Botón */}
        <Link to="/" className="notfound-button">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

export default NotFound;