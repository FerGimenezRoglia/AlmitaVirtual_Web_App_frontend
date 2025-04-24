// src/components/AlmitaDisplay.jsx
import React from 'react';

/**
 * Muestra la imagen animada de Almita según estado y color.
 *
 * Props:
 * - status: string (por ejemplo, "IDLE", "ACTIVE", etc.)
 * - color: string (por ejemplo, "NEUTRAL", "BLUE", etc.)
 */
const AlmitaDisplay = ({ status = 'IDLE', color = 'NEUTRAL' }) => {
  // Normalizamos a minúsculas para usar en el nombre del archivo
  const fileName = `almita_${status.toLowerCase()}_${color.toLowerCase()}.gif`;

  return (
    <img
      src={`/assets/almita/${fileName}`}
      alt={`Estado ${status} con color ${color}`}
      className="almita-image"
    />
  );
};

export default AlmitaDisplay;