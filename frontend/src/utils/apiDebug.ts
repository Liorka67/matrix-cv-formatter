// Debug utility to verify API configuration
export const debugApiConfig = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://matrix-cv-backend.onrender.com/api';
  
  console.log('🔧 API Configuration Debug:');
  console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('- Final API_BASE_URL:', API_BASE_URL);
  console.log('- Upload URL:', `${API_BASE_URL}/upload`);
  console.log('- Process URL:', `${API_BASE_URL}/process/[uploadId]`);
  console.log('- Health URL:', `${API_BASE_URL}/health`);
  
  return API_BASE_URL;
};