import React from 'react';
import { ProcessResponse } from '../types';

interface ProcessingScreenProps {
  fileName?: string;
  language?: 'he' | 'en';
  processingMetadata?: ProcessResponse['metadata'];
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ 
  fileName, 
  language,
  processingMetadata 
}) => {
  const getLanguageText = (lang?: 'he' | 'en') => {
    return lang === 'en' ? 'English' : 'עברית';
  };

  return (
    <div className="processing-screen">
      <h2 className="processing-title">
        מעבדת את קורות החיים...
      </h2>
      
      <div className="loading-spinner"></div>
      
      <div className="processing-details">
        {fileName && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>קובץ:</strong> {fileName}
          </div>
        )}
        
        {language && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>שפה:</strong> {getLanguageText(language)}
          </div>
        )}
        
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#7f8c8d',
          lineHeight: '1.6'
        }}>
          <p>🔍 חולצת טקסט מהקובץ</p>
          <p>🤖 מעבדת עם בינה מלאכותית</p>
          <p>✅ בודקת שלמות המידע</p>
          <p>📋 יוצרת קורות חיים מובנים</p>
        </div>
        
        {processingMetadata && (
          <div style={{ 
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#6c757d'
          }}>
            {processingMetadata.retryCount !== undefined && processingMetadata.retryCount > 0 && (
              <div>🔄 ניסיונות חוזרים: {processingMetadata.retryCount}</div>
            )}
            {processingMetadata.finalCoverage !== undefined && (
              <div>📊 כיסוי תוכן: {(processingMetadata.finalCoverage * 100).toFixed(1)}%</div>
            )}
          </div>
        )}
        
        <div style={{ 
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#95a5a6'
        }}>
          התהליך יכול לקחת עד דקה...
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;