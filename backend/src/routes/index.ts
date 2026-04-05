import express from 'express';
import cors from 'cors';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';
import { uploadFile } from '../controllers/uploadController';
import { processCV, testCoverage } from '../controllers/processController';
import { generateDOCX, generatePDF } from '../controllers/generateController';
import { asyncHandler } from '../middleware/errorHandler';
import { getStorageStats } from '../utils/fileStorage';

const router = express.Router();

// CORS configuration for download endpoints
const downloadCorsOptions = {
  origin: [
    'https://matrix-cv-formatter-1.onrender.com',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    success: true,
    message: 'CV Matrix Converter API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint to check file storage status
router.get('/debug/storage', (req, res) => {
  const stats = getStorageStats();
  res.json({
    success: true,
    storage: stats,
    timestamp: new Date().toISOString()
  });
});

// File upload endpoint
router.post('/upload', 
  uploadMiddleware.single('file'),
  handleUploadError,
  asyncHandler(uploadFile)
);

// CV processing endpoint
router.post('/process/:uploadId',
  asyncHandler(processCV)
);

// Document generation endpoints
router.post('/generate/docx', asyncHandler(generateDOCX));
router.post('/generate/pdf', asyncHandler(generatePDF));

// Download endpoints with explicit CORS handling
router.options('/download/docx', cors(downloadCorsOptions));
router.options('/download/pdf', cors(downloadCorsOptions));

router.post('/download/docx', cors(downloadCorsOptions), asyncHandler(generateDOCX));
router.post('/download/pdf', cors(downloadCorsOptions), asyncHandler(generatePDF));

// Test coverage calculation endpoint
router.post('/test/coverage',
  asyncHandler(testCoverage)
);

export default router;