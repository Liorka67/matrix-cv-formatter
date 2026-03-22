import React from 'react';
import { ProcessResponse } from '../types';

interface ResultScreenProps {
  fileName: string;
  language: 'he' | 'en';
  processingMetadata?: ProcessResponse['metadata'];
  onViewPreview: () => void;
  onDownloadWord: () => void;
  onDownloadPDF: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  fileName,
  language,
  processingMetadata,
  onViewPreview,
  onDownloadWord,
  onDownloadPDF
}) => {
  const getLanguageText = (lang: 'he' | 'en') => {
    return lang === 'en' ? 'English' : 'עברית';
  };

  return (
    <div className="result-screen">
      <div className="result-header">
        <h2 className="result-title">
          ✅ הקובץ מוכן!
        </h2>
        
        <div className="result-details">
          <div className="result-file-info">
            <div><strong>קובץ:</strong> {fileName}</div>
            <div><strong>שפה:</strong> {getLanguageText(language)}</div>
          </div>
          
          {processingMetadata && (
            <div className="processing-summary">
              <div className="summary-item">
                <span className="summary-label">זמן עיבוד:</span>
                <span className="summary-value">{(processingMetadata.processingTime / 1000).toFixed(1)} שניות</span>
              </div>
              
              {processingMetadata.finalCoverage !== undefined && (
                <div className="summary-item">
                  <span className="summary-label">כיסוי תוכן:</span>
                  <span className="summary-value">{(processingMetadata.finalCoverage * 100).toFixed(1)}%</span>
                </div>
              )}
              
              {processingMetadata.retryCount !== undefined && processingMetadata.retryCount > 0 && (
                <div className="summary-item">
                  <span className="summary-label">ניסיונות חוזרים:</span>
                  <span className="summary-value">{processingMetadata.retryCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="result-actions">
        <button 
          className="action-button primary"
          onClick={onViewPreview}
        >
          📋 הצגת קורות חיים
        </button>
        
        <div className="download-buttons">
          <button 
            className="action-button secondary"
            onClick={onDownloadWord}
          >
            📄 הורדת קובץ (Word)
          </button>
          
          <button 
            className="action-button secondary"
            onClick={onDownloadPDF}
          >
            📑 הורדת קובץ (PDF)
          </button>
        </div>
      </div>
      
      {processingMetadata?.warnings && processingMetadata.warnings.length > 0 && (
        <div className="result-warnings">
          <h4>התראות:</h4>
          <ul>
            {processingMetadata.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;