import axios from 'axios';
import { UploadResponse, ProcessResponse, MatrixCV } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://matrix-cv-backend.onrender.com/api';

export class ApiService {
  
  /**
   * Upload CV file
   */
  static async uploadFile(file: File, language: 'he' | 'en'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    
    const uploadUrl = `${API_BASE_URL}/upload`;
    
    try {
      console.log('🔗 API Call: Upload to', uploadUrl);
      const response = await axios.post<UploadResponse>(uploadUrl, formData, {
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
    const processUrl = `${API_BASE_URL}/process/${uploadId}`;
    
    try {
      console.log('🔗 API Call: Process to', processUrl);
      
      const response = await axios.post<ProcessResponse>(processUrl, {
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
    const downloadUrl = `${API_BASE_URL}/download/docx`;
    console.log('🔗 API Call: Download DOCX to', downloadUrl);
    
    const response = await axios.post(downloadUrl, { cv, language }, { 
      responseType: 'blob',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const fileUrl = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `CV_${cv.personal_details?.name || 'export'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  }

  /**
   * Download CV as PDF
   */
  static async downloadPdf(cv: MatrixCV, language: 'he' | 'en'): Promise<void> {
    const downloadUrl = `${API_BASE_URL}/download/pdf`;
    console.log('🔗 API Call: Download PDF to', downloadUrl);
    
    const response = await axios.post(downloadUrl, { cv, language }, { 
      responseType: 'blob',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const fileUrl = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `CV_${cv.personal_details?.name || 'export'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  }

  /**
   * Check API health
   */
  static async checkHealth(): Promise<boolean> {
    const healthUrl = `${API_BASE_URL}/health`;
    
    try {
      console.log('🔗 API Call: Health check to', healthUrl);
      
      const response = await axios.get(healthUrl, {
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