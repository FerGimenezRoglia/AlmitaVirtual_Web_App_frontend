export const getRoleFromToken = (token) => {
    if (!token) return null;
  
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.authorities ? decoded.authorities[0] : null;
  };

  export const getUsernameFromToken = (token) => {
    if (!token) return 'Usuario';
  
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || 'Usuario';
    } catch (err) {
      console.error('Token inválido:', err);
      return 'Usuario';
    }
  };