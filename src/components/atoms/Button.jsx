import React from 'react';

/**
 * Botón reutilizable con el estilo Almita Virtual.
 *
 * Props:
 * - children: texto del botón
 * - onClick: función a ejecutar al hacer click
 * - type: "button", "submit", etc.
 * - className: estilos adicionales opcionales
 */
const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`px-4 py-2 border border-[var(--color-main-1)] text-[var(--color-main-1)] font-mono text-sm rounded-md hover:bg-[var(--color-main-1)] hover:text-[var(--color-background-1)] transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;