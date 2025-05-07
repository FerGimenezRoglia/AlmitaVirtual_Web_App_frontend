import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Nuevo archivo para centralizar estilos

const NotFound = () => {
  return (
    <section className="notfound-wrapper">
      <div className="notfound-content">

        {/* Imagen central, cuadrada */}
        <div className="notfound-image">
          <img src="/assets/404.png" alt="404 Not Found" />
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