import React, { useEffect, useState } from 'react';
import { RotateCcw, Eye } from 'lucide-react';
import './VerificationResult.css';

const VerificationResult = ({ result, onReset }) => {
// simplified view

  return (
    <div className="result-container fade-in-up">
// showing only extracted text

      {result.extracted_text && (
        <div className="ocr-section glass-panel fade-in-up" style={{ marginTop: '2rem' }}>
          <div className="ocr-header">
              <Eye size={20} color="var(--secondary)" /> 
              <h3>Extracted Text</h3>
          </div>
          <div className="ocr-content" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
            {result.extracted_text}
          </div>
        </div>
      )}

      <button className="btn btn-secondary reset-btn" style={{ marginTop: '2rem' }} onClick={onReset}>
        <RotateCcw size={20} /> Verify Another Document
      </button>
    </div>
  );
};

export default VerificationResult;
