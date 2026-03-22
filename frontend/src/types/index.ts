// API Types matching backend
export interface MatrixCV {
  personal_details: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
  };
  summary: string;
  experience: Experience[];
  skills: string[];
  education: Education[];
  languages: Language[];
  additional: string;
}

export interface Experience {
  years: string;
  role: string;
  company?: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface UploadResponse {
  success: boolean;
  uploadId: string;
  filename: string;
  size: number;
  type: string;
}

export interface ProcessResponse {
  success: boolean;
  data?: MatrixCV;
  error?: string;
  metadata?: {
    processId: string;
    language: 'he' | 'en';
    processingTime: number;
    extractedTextLength: number;
    retryCount?: number;
    finalCoverage?: number;
    warnings?: string[];
  };
}

// UI State Types
export type AppScreen = 'landing' | 'processing' | 'result' | 'preview';

export interface AppState {
  screen: AppScreen;
  selectedFile: File | null;
  selectedLanguage: 'he' | 'en' | null;
  uploadId: string | null;
  processResult: MatrixCV | null;
  error: string | null;
  isLoading: boolean;
  processingMetadata?: ProcessResponse['metadata'];
}