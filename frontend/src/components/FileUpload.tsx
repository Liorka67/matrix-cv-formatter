import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      onFileSelect(file);
    } else {
      alert('אנא בחרי קובץ PDF או DOCX בלבד');
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    } else {
      alert('אנא בחרי קובץ PDF או DOCX בלבד');
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [onFileSelect]);

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return validTypes.includes(file.type);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">
        העלאת קובץ קורות חיים
      </label>
      
      {!selectedFile ? (
        <div
          className={`file-drop-zone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <div className="file-drop-text">
            גררי את הקובץ לכאן או לחצי לבחירה
          </div>
          <div className="file-drop-subtext">
            קבצי PDF או DOCX בלבד (עד 10MB)
          </div>
          
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="selected-file">
          <div className="selected-file-name">
            📄 {selectedFile.name}
          </div>
          <div className="selected-file-details">
            גודל: {formatFileSize(selectedFile.size)} | 
            סוג: {selectedFile.type.includes('pdf') ? 'PDF' : 'Word'}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onFileSelect(null as any)}
              className="change-file-button"
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '0.5rem'
              }}
            >
              שנה קובץ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;