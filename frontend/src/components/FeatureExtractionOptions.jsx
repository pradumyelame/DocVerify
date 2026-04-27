import React, { useState } from 'react';
import { Cpu, Check, Brain, Move, Box, Layers, MousePointer2 } from 'lucide-react';
import './FeatureExtractionOptions.css';

const featureList = [
  { id: 'CNN', name: 'Convolutional Neural Network (CNN)', desc: 'Extracts deep visual patterns and high-level document features.', icon: <Brain size={20} /> },
  { id: 'SIFT', name: 'SIFT (Scale-Invariant Feature Transform)', desc: 'Detects local keypoints independent of rotation or scale.', icon: <Move size={20} /> },
  { id: 'HOG', name: 'HOG (Histogram of Oriented Gradients)', desc: 'Analyzes structural edges and shape orientations.', icon: <Box size={20} /> },
  { id: 'LBP', name: 'LBP (Local Binary Patterns)', desc: 'Quantifies texture consistency to find tampered regions.', icon: <Layers size={20} /> },
  { id: 'ORB', name: 'ORB (Oriented FAST and Rotated BRIEF)', desc: 'Fast and efficient keypoint matching for authentication.', icon: <MousePointer2 size={20} /> },
];

const FeatureExtractionOptions = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState(['CNN', 'SIFT', 'HOG', 'LBP', 'ORB']);

  const toggleFeature = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="options-container glass-panel fade-in-up">
      <div className="options-header">
        <Cpu className="header-icon" />
        <h2>Feature Extraction</h2>
        <p>Select the models and algorithms to analyze the document features.</p>
      </div>

      <div className="techniques-grid">
        {featureList.map(item => (
          <div 
            key={item.id} 
            className={`tech-card ${selected.includes(item.id) ? 'selected' : ''}`}
            onClick={() => toggleFeature(item.id)}
          >
            <div className="tech-icon-wrapper">{item.icon}</div>
            <div className="tech-info">
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="checkbox">
              {selected.includes(item.id) && <Check size={16} />}
            </div>
          </div>
        ))}
      </div>

      <div className="options-footer">
        <button className="btn btn-secondary" onClick={onBack}>Back to Preprocessing</button>
        <button 
          className="btn btn-primary" 
          disabled={selected.length === 0}
          onClick={() => onNext(selected)}
        >
          Finalize Analysis
        </button>
      </div>
    </div>
  );
};

export default FeatureExtractionOptions;
