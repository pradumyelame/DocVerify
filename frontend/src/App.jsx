import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import './App.css';
import UploadZone from './components/UploadZone';
import VerificationResult from './components/VerificationResult';
import PreprocessingOptions from './components/PreprocessingOptions';
import FeatureExtractionOptions from './components/FeatureExtractionOptions';

const STEPS = {
  UPLOAD: 'upload',
  PREPROCESSING: 'preprocessing',
  FEATURE_OPTIONS: 'feature_options',
  LOADING: 'loading',
  RESULT: 'result'
};

const VerificationFlow = ({ role }) => {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [featureTechniques, setFeatureTechniques] = useState(['CNN', 'SIFT', 'HOG', 'LBP', 'ORB']);

  const performVerification = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.data);
        setStep(STEPS.RESULT);
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert(error.message || 'Verification failed. Please try again.');
      setStep(STEPS.UPLOAD);
    }
  };

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    if (role === 'user') {
      setStep(STEPS.LOADING);
      const defaultTechniques = ["resizing", "grayscale"];
      const defaultFeatureTechniques = ['CNN', 'SIFT', 'HOG', 'LBP', 'ORB'];
      
      setSelectedTechniques(defaultTechniques);
      setFeatureTechniques(defaultFeatureTechniques);
      
      const formData = new FormData();
      formData.append('document', uploadedFile);
      formData.append('techniques', JSON.stringify(defaultTechniques));
      formData.append('feature_techniques', JSON.stringify(defaultFeatureTechniques));
      formData.append('role', role);
      
      performVerification(formData);
    } else {
      setStep(STEPS.PREPROCESSING);
    }
  };

  const handlePreprocessingSelect = (techniques) => {
    setSelectedTechniques(techniques);
    setStep(STEPS.FEATURE_OPTIONS);
  };

  const handleFeatureSelect = async (techniques) => {
    setFeatureTechniques(techniques);
    setStep(STEPS.LOADING);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('techniques', JSON.stringify(selectedTechniques));
    formData.append('feature_techniques', JSON.stringify(techniques));
    formData.append('role', role);

    await performVerification(formData);
  };

  const resetFlow = () => {
    setStep(STEPS.UPLOAD);
    setFile(null);
    setResult(null);
    setSelectedTechniques([]);
  };

  return (
    <main className="app-main">
      <div className="content-wrapper">
        {step === STEPS.UPLOAD && (
          <div className="hero-main fade-in-up">
            <h1 className="section-title">Intelligent Document Verification</h1>
            <p style={{color: 'var(--text-muted)', marginBottom: '3rem'}}>Advanced authenticity analysis with selective feature extraction.</p>
            <UploadZone onUpload={handleUpload} />
          </div>
        )}

        {step === STEPS.PREPROCESSING && (
          <PreprocessingOptions 
            onNext={handlePreprocessingSelect} 
            onBack={() => setStep(STEPS.UPLOAD)}
          />
        )}

        {step === STEPS.FEATURE_OPTIONS && (
          <FeatureExtractionOptions
            onNext={handleFeatureSelect}
            onBack={() => setStep(STEPS.PREPROCESSING)}
          />
        )}

        {step === STEPS.LOADING && (
          <div className="loading-container container-centered fade-in-up">
            <div className="scanner-overlay">
                <div className="scanner-line"></div>
            </div>
            <div className="loading-text" style={{textAlign: 'center', marginTop: '2rem'}}>
                <div style={{marginTop: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            </div>
          </div>
        )}

        {step === STEPS.RESULT && result && (
          <VerificationResult result={result} role={role} onReset={resetFlow} />
        )}
      </div>
    </main>
  );
};

import BlockchainViewer from './components/BlockchainViewer';
import { User, ShieldAlert, LogOut } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function Dashboard() {
  const { user, logout } = useAuth();
  const [adminTab, setAdminTab] = useState('VERIFY'); // 'VERIFY' or 'BLOCKCHAIN'

  return (
    <div className="app-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <nav className="mode-nav glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          {user.role === 'admin' ? <ShieldAlert size={18} color="var(--primary)" /> : <User size={18} color="var(--primary)" />}
          <span>{user.username} ({user.role})</span>
        </div>
        <button className="nav-btn" onClick={logout} style={{ color: 'var(--danger)', padding: '0.5rem' }}>
          <LogOut size={16} style={{marginRight: '6px'}} /> Logout
        </button>
      </nav>

      {user.role === 'user' ? (
        <VerificationFlow role="user" />
      ) : (
        <div className="admin-container">
          <div className="admin-tabs fade-in-up">
            <button 
              className={`btn ${adminTab === 'VERIFY' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAdminTab('VERIFY')}
            >
              Upload & Verify Document
            </button>
            <button 
              className={`btn ${adminTab === 'BLOCKCHAIN' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAdminTab('BLOCKCHAIN')}
            >
              View Blockchain Ledger
            </button>
          </div>
          
          {adminTab === 'VERIFY' && <VerificationFlow role="admin" />}
          {adminTab === 'BLOCKCHAIN' && <BlockchainViewer />}
        </div>
      )}
    </div>
  );
}

function RootApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}



export default RootApp;
