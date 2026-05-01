import React from 'react';
import { RotateCcw, ShieldCheck, AlertTriangle, Fingerprint, Activity, Database } from 'lucide-react';
import './VerificationResult.css';

const DigitalVerificationResult = ({ result, onReset }) => {
  return (
    <div className="result-container fade-in-up">
      <div className={`status-banner glass-panel ${result.decision === 'DOCUMENT IS OKAY' ? 'verified-true' : 'verified-false'}`} style={{ padding: '2rem', textAlign: 'center', borderRadius: '12px', border: `2px solid ${result.decision === 'DOCUMENT IS OKAY' ? 'var(--accent)' : 'var(--danger)'}` }}>
        <h2 style={{ color: result.decision === 'DOCUMENT IS OKAY' ? 'var(--accent)' : 'var(--danger)', fontSize: '2.5rem', marginBottom: '0', margin: 0 }}>
          {result.decision}
        </h2>
      </div>

      <div className="tamper-analysis-section glass-panel" style={{ marginTop: '1.5rem', border: '1px solid var(--secondary)', background: 'rgba(56, 189, 248, 0.05)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left' }}>
        <div className="tamper-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
          <Activity size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Verification Analysis</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-main)' }}>
          {result.explainable_reasons && result.explainable_reasons.map((reason, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>{reason}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Database size={20} color="var(--primary)" />
            <h4 style={{ margin: 0, color: 'var(--primary)' }}>Structured Data (Affinda API)</h4>
          </div>
          {result.affinda_extraction?.status === 'success' ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {Object.entries(result.affinda_extraction.data).map(([key, value]) => {
                if (key === 'raw_text') return null; // Skip rendering raw text in this list
                return (
                  <p key={key} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</strong> {String(value)}
                  </p>
                );
              })}
              {Object.keys(result.affinda_extraction.data).length <= 1 && (
                <p style={{ color: 'var(--text-muted)' }}>No structured fields extracted by the current Affinda Model.</p>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--danger)' }}>Failed to extract data via Affinda API.</p>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <h4 style={{ margin: 0, color: '#f59e0b' }}>Metadata Analysis</h4>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <p><strong>Creation Date:</strong> {result.metadata_analysis?.creation_date}</p>
            <p><strong>Modification Date:</strong> {result.metadata_analysis?.modification_date}</p>
            <p><strong>Software Used:</strong> {result.metadata_analysis?.software}</p>
            {result.metadata_analysis?.suspicious_edits_detected && (
              <p style={{ color: 'var(--danger)', fontWeight: 'bold', marginTop: '0.5rem' }}>⚠️ Suspicious Editing Software Detected!</p>
            )}
          </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent)', marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Fingerprint size={20} color="var(--accent)" />
            <h4 style={{ margin: 0, color: 'var(--accent)' }}>Document Fingerprint</h4>
          </div>
          <code style={{ display: 'block', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', wordBreak: 'break-all', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {result.fingerprint || 'N/A'}
          </code>
      </div>

      <button className="btn btn-secondary reset-btn" style={{ marginTop: '2rem', width: '100%' }} onClick={onReset}>
        <RotateCcw size={20} /> Verify Another Digital Document
      </button>
    </div>
  );
};

export default DigitalVerificationResult;
