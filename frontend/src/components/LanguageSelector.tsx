import React from 'react';

interface LanguageSelectorProps {
  selectedLanguage: 'he' | 'en' | null;
  onLanguageSelect: (language: 'he' | 'en') => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect,
  disabled
}) => {
  return (
    <div className="language-selection">
      <label className="language-label">
        בחירת שפה לעיבוד
      </label>
      
      <div className="language-options">
        <label className="language-option">
          <input
            type="radio"
            name="language"
            value="he"
            checked={selectedLanguage === 'he'}
            onChange={() => onLanguageSelect('he')}
            disabled={disabled}
          />
          עברית
        </label>
        
        <label className="language-option">
          <input
            type="radio"
            name="language"
            value="en"
            checked={selectedLanguage === 'en'}
            onChange={() => onLanguageSelect('en')}
            disabled={disabled}
          />
          English
        </label>
      </div>
      
      {selectedLanguage && (
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.9rem', 
          color: '#7f8c8d',
          textAlign: 'center'
        }}>
          {selectedLanguage === 'he' 
            ? 'קורות החיים יעובדו בעברית' 
            : 'The CV will be processed in English'
          }
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;