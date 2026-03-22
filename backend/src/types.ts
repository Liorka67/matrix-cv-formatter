// ===== CV STRUCTURE =====
export interface MatrixCV {
  personal_details: {
    name: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  summary: string;
  experience: any[];
  skills: any[];
  education: any[];
  languages: any[];
  projects?: any[];
  additional: string;
}

// ===== AI RESULT =====
export interface AIProcessingResult {
  structuredCV: MatrixCV;
  processingTime: number;
  retryCount: number;
  finalCoverage: number;
}

// ===== UPLOAD =====
export interface UploadResponse {
  success: boolean;
  uploadId: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  language?: 'he' | 'en';
  savedPath?: string;
  [key: string]: any;
}

// ===== PROCESS =====
export interface ProcessResponse {
  success: boolean;
  data?: any;
  error?: string;
  [key: string]: any;
}

// ===== TEXT EXTRACTION =====
export interface ExtractedText {
  content: string;
  wordCount?: number;
  pageCount?: number;
  [key: string]: any;
}