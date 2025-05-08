
import React from 'react';

/**
 * Muestra la animación de Almita según estado y color, en loop y autoplay.
 *
 * Props:
 * - status: string ("ACTIVE", "IDLE", etc.)
 * - color: string ("NEUTRAL", "YELLOW", etc.)
 */
const AlmitaDisplay = ({ status = 'IDLE', color = 'NEUTRAL' }) => {
  const fileName = `almita_${status.toLowerCase()}_${color.toLowerCase()}.mp4`;

  return (
    <video
      src={`/assets/almitaPictures/${fileName}`}
      className="almita-image"
      autoPlay
      loop
      muted
      playsInline
    />
  );
};

export default AlmitaDisplay;



/* Código para imágenes.

const AlmitaDisplay = ({ status = 'IDLE', color = 'NEUTRAL' }) => {
  const fileName = `almita_${status.toLowerCase()}_${color.toLowerCase()}.png`;

  return (
    <img
      src={`/assets/almitaPictures/${fileName}`}
      alt={`Estado ${status} con color ${color}`}
      className="almita-image"
    />
  );
};

export default AlmitaDisplay; 

*/