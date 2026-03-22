import { Request, Response } from 'express';
import fs from 'fs';
import { ProcessResponse } from '../types';
import { TextExtractorService } from '../services/textExtractor';
import { AIService } from '../services/aiService';
import { ContentValidator } from '../services/contentValidator';
import { v4 as uuidv4 } from 'uuid';
import { getFileMetadata, removeFileMetadata } from '../utils/fileStorage';

export const processCV = async (req: Request, res: Response): Promise<void> => {
  console.log("🚀 DEBUG MODE: Starting MINIMAL CV processing");
  
  try {
    // STEP 1: Get basic parameters
    const { uploadId } = req.params;
    const { language } = req.body;
    console.log("STEP 1: Parameters received", { uploadId, language });

    if (!uploadId || !language) {
      console.log("STEP 1: FAILED - Missing parameters");
      res.status(400).json({
        success: false,
        error: 'Missing uploadId or language'
      });
      return;
    }

    // STEP 2: Get file metadata
    console.log("STEP 2: Getting file metadata");
    const fileMetadata = getFileMetadata(uploadId);
    console.log("STEP 2: File metadata", fileMetadata);
    
    if (!fileMetadata) {
      console.log("STEP 2: FAILED - No file metadata");
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
      return;
    }

    // STEP 3: Check file exists
    console.log("STEP 3: Checking file exists");
    const { filePath, mimeType, originalName } = fileMetadata;
    console.log("STEP 3: File details", { filePath, mimeType, originalName });
    
    if (!fs.existsSync(filePath)) {
      console.log("STEP 3: FAILED - File does not exist on disk");
      res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
      return;
    }

    // STEP 4: Extract text (MINIMAL)
    console.log("STEP 4: Extracting text");
    const textExtractor = new TextExtractorService();
    const extractedText = await textExtractor.extractText(filePath, mimeType);
    console.log("STEP 4: Text extracted", { 
      contentLength: extractedText.content.length,
      wordCount: extractedText.metadata.wordCount 
    });

    if (!extractedText.content || extractedText.content.length < 10) {
      console.log("STEP 4: FAILED - Text too short");
      res.status(422).json({
        success: false,
        error: 'Extracted text too short'
      });
      return;
    }

    // STEP 5: Call AI (MINIMAL - NO VALIDATION)
    console.log("STEP 5: Calling AI service");
    const aiService = new AIService();
    
    // Call AI directly without validation/retry logic
    const result = await aiService.structureCV(extractedText.content, language);
    const structuredCV = result.structuredCV;
    console.log("STEP 5: AI response received", {
      hasPersonalDetails: !!structuredCV.personal_details,
      skillsCount: structuredCV.skills?.length || 0,
      experienceCount: structuredCV.experience?.length || 0
    });

    // STEP 6: Clean up file
    console.log("STEP 6: Cleaning up file");
    try {
      fs.unlinkSync(filePath);
      removeFileMetadata(uploadId);
      console.log("STEP 6: File cleaned up successfully");
    } catch (cleanupError) {
      console.log("STEP 6: Cleanup warning:", cleanupError);
    }

    // STEP 7: Return response
    console.log("STEP 7: Preparing response");
    const response: ProcessResponse = {
      success: true,
      data: structuredCV,
      metadata: {
        processId: uuidv4(),
        language,
        processingTime: 0,
        extractedTextLength: extractedText.content.length,
        retryCount: 0,
        finalCoverage: 1.0, // Fake coverage for now
        warnings: []
      }
    };

    console.log("🎉 DEBUG SUCCESS: Returning response");
    res.status(200).json(response);

  } catch (error) {
    console.error("💥 DEBUG ERROR CAUGHT:");
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
  }
};

// Test endpoint to verify coverage calculation fixes
export const testCoverage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalText, structuredCV } = req.body;
    
    if (!originalText || !structuredCV) {
      res.status(400).json({
        success: false,
        error: 'originalText and structuredCV are required'
      });
      return;
    }
    
    const validator = new ContentValidator();
    const result = validator.calculateCoverage(originalText, structuredCV);
    
    res.json({
      success: true,
      coverage: result.coverage,
      isValid: result.isValid,
      missingContentCount: result.missingContent.length,
      needsRetry: result.needsRetry,
      reason: result.reason
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};