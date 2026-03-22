// Matrix CV Schema - Core data structure
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

// API Response Types
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

export interface UploadResponse {
  success: boolean;
  uploadId: string;
  filename: string;
  size: number;
  type: string;
}

// Service Types
export interface ExtractedText {
  content: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    language: 'he' | 'en' | 'mixed';
  };
}

export interface AIProcessingResult {
  structuredCV: MatrixCV;
  processingTime: number;
  tokensUsed?: number;
  retryCount?: number;
  finalCoverage?: number;
  warnings?: string[];
}