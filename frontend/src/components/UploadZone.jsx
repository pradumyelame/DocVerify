import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import './UploadZone.css';

const UploadZone = ({ onUpload, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Accept Image, PDF, and MS Word Docs
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isWord = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
    
    if (isImage || isPDF || isWord) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="upload-container glass-card">
      <h2>Verify Document</h2>
      <p className="upload-desc">Upload a certificate, marksheet, ID card or signature image to detect tampering.</p>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form className="upload-form" onSubmit={handleSubmit}>
        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input type="file" id="file-upload" multiple={false} onChange={handleChange} accept="image/png, image/jpeg, application/pdf, .doc, .docx" />
          <label htmlFor="file-upload" className="drop-zone-content">
            {!selectedFile ? (
              <>
                <div className="icon-wrapper">
                  <UploadCloud size={48} className="upload-icon" />
                </div>
                <h3>Drag & Drop your file</h3>
                <p>or click to browse from device</p>
                <span className="file-hint">Supported formats: JPG, PNG, PDF, DOCX (Max 16MB)</span>
              </>
            ) : (
              <div className="file-selected">
                <FileText size={48} className="file-icon" />
                <h3>{selectedFile.name}</h3>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <CheckCircle size={24} className="success-icon" />
              </div>
            )}
          </label>
        </div>

        <button type="submit" className="btn btn-primary submit-btn" disabled={!selectedFile}>
          Start Analysis
        </button>
      </form>
    </div>
  );
};

export default UploadZone;
