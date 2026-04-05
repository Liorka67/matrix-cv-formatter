import axios from 'axios';
import { UploadResponse, ProcessResponse, MatrixCV } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://matrix-cv-backend.onrender.com/api';

// Helper function to ensure full URL
const getFullUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

export class ApiService {
  
  /**
   * Upload CV file
   */
  static async uploadFile(file: File, language: 'he' | 'en'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    
    try {
      console.log('🔗 API Call: Upload to', getFullUrl('/upload'));
      const response = await axios.post<UploadResponse>(getFullUrl('/upload'), formData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Upload API Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'שגיאה בהעלאת הקובץ');
      }
      throw new Error('שגיאה בהעלאת הקובץ');
    }
  }
  
  /**
   * Process uploaded CV
   */
  static async processCV(uploadId: string, language: 'he' | 'en'): Promise<ProcessResponse> {
    try {
      const url = getFullUrl(`/process/${uploadId}`);
      console.log('🔗 API Call: Process to', url);
      
      const response = await axios.post<ProcessResponse>(url, {
        language,
      }, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Process API Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'שגיאה בעיבוד קורות החיים');
      }
      throw new Error('שגיאה בעיבוד קורות החיים');
    }
  }
  
  /**
   * Download CV as DOCX
   */
  static async downloadDocx(cv: MatrixCV, language: 'he' | 'en'): Promise<void> {
    const url = getFullUrl('/download/docx');
    console.log('🔗 API Call: Download DOCX to', url);
    
    const response = await axios.post(url, { cv, language }, { 
      responseType: 'blob',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const downloadUrl = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `CV_${cv.personal_details?.name || 'export'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Download CV as PDF
   */
  static async downloadPdf(cv: MatrixCV, language: 'he' | 'en'): Promise<void> {
    const url = getFullUrl('/download/pdf');
    console.log('🔗 API Call: Download PDF to', url);
    
    const response = await axios.post(url, { cv, language }, { 
      responseType: 'blob',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const downloadUrl = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `CV_${cv.personal_details?.name || 'export'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Check API health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const url = getFullUrl('/health');
      console.log('🔗 API Call: Health check to', url);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}