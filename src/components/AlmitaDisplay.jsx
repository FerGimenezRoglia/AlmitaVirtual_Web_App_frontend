import React from 'react';

/**
 * Muestra la imagen o animación de Almita según estado y color.
 *
 * Props:
 * - status: string ("ACTIVE", "IDLE", etc.)
 * - color: string ("NEUTRAL", "YELLOW", etc.)
 */
const AlmitaDisplay = ({ status = 'IDLE', color = 'NEUTRAL' }) => {
  const fileName = `almita_${status.toLowerCase()}_${color.toLowerCase()}.png`; // .gif o .mg4 si es animación

  return (
    <img
      src={`/assets/almitaPictures/${fileName}`}
      alt={`Estado ${status} con color ${color}`}
      className="almita-image"
    />
  );
};

export default AlmitaDisplay;