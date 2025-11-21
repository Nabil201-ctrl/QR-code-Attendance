// Support both Vite-style VITE_BACKEND_URL and legacy REACT_APP_BACKEND_URL env names,
// and fall back to the deployed URL when not provided (so dev builds don't crash).
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'https://qr-attendance-3dof.onrender.com';