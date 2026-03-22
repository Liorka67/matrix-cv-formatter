import express from 'express';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';
import { uploadFile } from '../controllers/uploadController';
import { processCV, testCoverage } from '../controllers/processController';
import { generateDOCX, generatePDF } from '../controllers/generateController';
import { asyncHandler } from '../middleware/errorHandler';
import { getStorageStats } from '../utils/fileStorage';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
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

// Test coverage calculation endpoint
router.post('/test/coverage',
  asyncHandler(testCoverage)
);

export default router;