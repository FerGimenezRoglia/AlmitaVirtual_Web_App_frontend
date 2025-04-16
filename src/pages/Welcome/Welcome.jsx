import React from 'react';
import './Welcome.css';

const Welcome = () => {
  return (
    <section className="welcome-wrapper">
      <div className="title-block">
        <p className="title">ALMITA _ VIRTUAL</p>
      </div>

      <div className="description-block">
        <p className="description">
          "ALMITA VIRTUAL" ES UNA APLICACIÓN WEB DONDE CREAS TU ESPACIO DIGITAL PARA PRESENTAR O COMPARTIR TU CURRÍCULUM, CARTA DE PRESENTACIÓN U OTROS DOCUMENTOS IMPORTANTES.
        </p>
      </div>

      <div className="menu-block">
        <div className="grouped-items">
          <p className="menu-item first">INFO _</p>
          <p className="menu-item second">COMENZAR _</p>
        </div>

        <p className="menu-item spaced">[HOLA]</p>
      </div>
    </section>
  );
};

export default Welcome;