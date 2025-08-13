// API Configuration
// You can modify these values or use environment variables if your build system supports it

export const API_CONFIG = {
    MEEE_API_URL: "http://localhost:3001/api/chat", // o la url
    MEEE_API_KEY: API_CONFIG.MEEE_API_KEY
};

// If you're using Vite, you can use import.meta.env instead:
// export const API_CONFIG = {
//     MEEE_API_URL: import.meta.env.VITE_MEEE_API_URL || "https://meeeapi.vercel.app/meeeapi",
// };

// If you're using Create React App, you can use process.env with REACT_APP_ prefix:
// export const API_CONFIG = {
//     MEEE_API_URL: process.env.REACT_APP_MEEE_API_URL || "https://meeeapi.vercel.app/meeeapi",
//     MEEE_API_KEY: process.env.REACT_APP_MEEE_API_KEY || 
// };