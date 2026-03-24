import axios from 'axios';
import { UploadResponse, ProcessResponse, MatrixCV } from '../types';

const api = axios.create({
  baseURL: 'https://matrix-cv-formatter.onrender.com/api',
  timeout: 60000, // 60 seconds for file processing
});

export class ApiService {
  
  /**
   * Upload CV file
   */
  static async uploadFile(file: File, language: 'he' | 'en'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    
    try {
      const response = await api.post<UploadResponse>('/upload', formData);

      return response.data;
    } catch (error) {
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
      const response = await api.post<ProcessResponse>(`/process/${uploadId}`, {
        language,
      });
      
      return response.data;
    } catch (error) {
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
    const response = await api.post('/download/docx', { cv, language }, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${cv.personal_details?.name || 'export'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download CV as PDF
   */
  static async downloadPdf(cv: MatrixCV, language: 'he' | 'en'): Promise<void> {
    const response = await api.post('/download/pdf', { cv, language }, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${cv.personal_details?.name || 'export'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Check API health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}