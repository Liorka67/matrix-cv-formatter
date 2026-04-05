import React, { useState, useEffect } from 'react';
import './styles/App.css';
import FileUpload from './components/FileUpload';
import LanguageSelector from './components/LanguageSelector';
import ProcessingScreen from './components/ProcessingScreen';
import ResultScreen from './components/ResultScreen';
import CVPreview from './components/CVPreview';
import { ApiService } from './services/api';
import { AppState, AppScreen, MatrixCV, ProcessResponse } from './types';
import { debugApiConfig } from './utils/apiDebug';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    screen: 'landing',
    selectedFile: null,
    selectedLanguage: null,
    uploadId: null,
    processResult: null,
    error: null,
    isLoading: false,
    processingMetadata: undefined
  });

  // Debug API configuration on component mount
  useEffect(() => {
    console.log("NEW BUILD TEST");
    debugApiConfig();
  }, []);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleFileSelect = (file: File | null) => {
    updateState({ 
      selectedFile: file, 
      error: null 
    });
  };

  const handleLanguageSelect = (language: 'he' | 'en') => {
    updateState({ 
      selectedLanguage: language, 
      error: null 
    });
  };

  const handleStartConversion = async () => {
    if (!state.selectedFile || !state.selectedLanguage) {
      updateState({ error: 'אנא בחרי קובץ ושפה לפני המשך' });
      return;
    }

    try {
      updateState({ 
        isLoading: true, 
        error: null, 
        screen: 'processing' 
      });

      console.log('Starting conversion process...');

      // Step 1: Upload file
      console.log('Uploading file:', state.selectedFile.name);
      const uploadResponse = await ApiService.uploadFile(state.selectedFile, state.selectedLanguage);
      
      if (!uploadResponse.success) {
        throw new Error('Upload failed');
      }

      console.log('Upload successful, uploadId:', uploadResponse.uploadId);
      updateState({ uploadId: uploadResponse.uploadId });

      // Step 2: Process CV
      console.log('Processing CV...');
      const processResponse = await ApiService.processCV(uploadResponse.uploadId, state.selectedLanguage);
      
      if (!processResponse.success || !processResponse.data) {
        throw new Error(processResponse.error || 'Processing failed');
      }

      console.log('Processing successful');
      
      // Step 3: Show results
      updateState({
        processResult: processResponse.data,
        processingMetadata: processResponse.metadata,
        screen: 'result',
        isLoading: false
      });

    } catch (error) {
      console.error('Conversion failed:', error);
      updateState({
        error: error instanceof Error ? error.message : 'שגיאה לא ידועה',
        isLoading: false,
        screen: 'landing'
      });
    }
  };

  const handleViewPreview = () => {
    updateState({ screen: 'preview' });
  };

  const handleBackToResults = () => {
    updateState({ screen: 'result' });
  };

  const handleDownloadWord = async () => {
    if (!state.processResult || !state.selectedLanguage) return;
    try {
      await ApiService.downloadDocx(state.processResult, state.selectedLanguage);
    } catch (error) {
      updateState({ error: 'שגיאה בהורדת קובץ Word' });
    }
  };

  const handleDownloadPDF = async () => {
    if (!state.processResult || !state.selectedLanguage) return;
    try {
      await ApiService.downloadPdf(state.processResult, state.selectedLanguage);
    } catch (error) {
      updateState({ error: 'שגיאה בהורדת קובץ PDF' });
    }
  };

  const handleStartOver = () => {
    updateState({
      screen: 'landing',
      selectedFile: null,
      selectedLanguage: null,
      uploadId: null,
      processResult: null,
      error: null,
      isLoading: false,
      processingMetadata: undefined
    });
  };

  const isConvertButtonEnabled = () => {
    return state.selectedFile && state.selectedLanguage && !state.isLoading;
  };

  // Render different screens based on current state
  const renderScreen = () => {
    switch (state.screen) {
      case 'landing':
        return (
          <div className="landing-screen">
            <div className="app-header">
              <h1 className="app-title">מטריקס גיוס המרת קורות חיים</h1>
              <p className="app-description">
                המירי קורות חיים לפורמט מובנה ואחיד עם בינה מלאכותית מתקדמת.
                <br />
                התהליך שומר על כל המידע המקורי ומבטיח דיוק מקסימלי.
              </p>
            </div>

            <div className="upload-section">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={state.selectedFile}
                disabled={state.isLoading}
              />

              <LanguageSelector
                selectedLanguage={state.selectedLanguage}
                onLanguageSelect={handleLanguageSelect}
                disabled={state.isLoading}
              />

              {state.error && (
                <div className="error-message">
                  ❌ {state.error}
                </div>
              )}

              <button
                className={`convert-button ${isConvertButtonEnabled() ? 'enabled' : 'disabled'}`}
                onClick={handleStartConversion}
                disabled={!isConvertButtonEnabled()}
              >
                {state.isLoading ? 'מעבד...' : 'התחילי המרה'}
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <ProcessingScreen
            fileName={state.selectedFile?.name}
            language={state.selectedLanguage || 'he'}
            processingMetadata={state.processingMetadata}
          />
        );

      case 'result':
        return (
          <div className="result-container">
            <ResultScreen
              fileName={state.selectedFile?.name || 'קובץ לא ידוע'}
              language={state.selectedLanguage || 'he'}
              processingMetadata={state.processingMetadata}
              onViewPreview={handleViewPreview}
              onDownloadWord={handleDownloadWord}
              onDownloadPDF={handleDownloadPDF}
            />
            
            <div className="result-footer">
              <button 
                className="start-over-button"
                onClick={handleStartOver}
              >
                המרה חדשה
              </button>
            </div>
          </div>
        );

      case 'preview':
        return state.processResult ? (
          <CVPreview
            cv={state.processResult}
            language={state.selectedLanguage || 'he'}
            onBack={handleBackToResults}
          />
        ) : (
          <div className="error-screen">
            <h2>שגיאה: לא נמצאו נתוני קורות חיים</h2>
            <button onClick={handleStartOver}>התחל מחדש</button>
          </div>
        );

      default:
        return (
          <div className="error-screen">
            <h2>שגיאה: מצב לא ידוע</h2>
            <button onClick={handleStartOver}>התחל מחדש</button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;