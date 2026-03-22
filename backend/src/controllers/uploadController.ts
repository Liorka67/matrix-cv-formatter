import { Request, Response } from 'express';
import { UploadResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { storeFileMetadata } from '../utils/fileStorage';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    const { language } = req.body;
    
    // Validate language parameter
    if (!language || !['he', 'en'].includes(language)) {
      res.status(400).json({
        success: false,
        error: 'Language parameter is required and must be either "he" or "en"'
      });
      return;
    }

    const uploadId = uuidv4();
    
    // Store file metadata in memory with uploadId mapping
    storeFileMetadata(uploadId, {
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      language
    });

    // Log upload for debugging
    console.log('File uploaded successfully:', {
      uploadId,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      language,
      savedPath: req.file.path
    });

    const response: UploadResponse = {
      success: true,
      uploadId,
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during file upload'
    });
  }
};