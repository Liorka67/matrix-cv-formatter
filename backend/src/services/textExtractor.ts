import fs from 'fs';
import mammoth from 'mammoth';
import { ExtractedText } from '../types';

// Use require for pdf-parse to avoid TypeScript issues
const pdfParse = require('pdf-parse');

export class TextExtractorService {
  
  /**
   * Extract text from PDF file
   */
  async extractFromPDF(filePath: string): Promise<ExtractedText> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      const extractedText: ExtractedText = {
        content: data.text.trim(),
        metadata: {
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).filter((word: string) => word.length > 0).length,
          language: this.detectLanguage(data.text)
        }
      };

      console.log(`PDF extraction completed: ${extractedText.metadata.wordCount} words, ${extractedText.metadata.pageCount} pages`);
      return extractedText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from DOCX file
   */
  async extractFromDOCX(filePath: string): Promise<ExtractedText> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value.trim();
      
      const extractedText: ExtractedText = {
        content: text,
        metadata: {
          wordCount: text.split(/\s+/).filter((word: string) => word.length > 0).length,
          language: this.detectLanguage(text)
        }
      };

      console.log(`DOCX extraction completed: ${extractedText.metadata.wordCount} words`);
      return extractedText;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text based on file type
   */
  async extractText(filePath: string, mimeType: string): Promise<ExtractedText> {
    if (mimeType === 'application/pdf') {
      return this.extractFromPDF(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractFromDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * Simple language detection based on character sets
   */
  private detectLanguage(text: string): 'he' | 'en' | 'mixed' {
    const hebrewRegex = /[\u0590-\u05FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    
    const hebrewMatches = text.match(hebrewRegex)?.length || 0;
    const englishMatches = text.match(englishRegex)?.length || 0;
    
    if (hebrewMatches > englishMatches * 2) return 'he';
    if (englishMatches > hebrewMatches * 2) return 'en';
    return 'mixed';
  }
}