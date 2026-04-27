import React, { useState } from 'react';
import { Settings, Check, Zap, Image as ImageIcon, Sparkles, Filter, Scissors, RotateCcw } from 'lucide-react';
import './PreprocessingOptions.css';

const categories = [
  {
    name: 'Basic & Color',
    techniques: [
      { id: 'resizing', name: 'Smart Resizing', desc: 'Standardizes document dimensions.', icon: <Scissors size={18} /> },
      { id: 'grayscale', name: 'Grayscale', desc: 'Removes color noise.', icon: <ImageIcon size={18} /> },
      { id: 'hsv', name: 'HSV Space', desc: 'Hue/Saturation/Value conversion.', icon: <Sparkles size={18} /> },
      { id: 'lab', name: 'LAB Space', desc: 'Perceptual color space.', icon: <Sparkles size={18} /> },
    ]
  },
  {
    name: 'Enhancement',
    techniques: [
      { id: 'equalization', name: 'Histogram Eq', desc: 'Global contrast boost.', icon: <Zap size={18} /> },
      { id: 'clahe', name: 'CLAHE', desc: 'Adaptive contrast enhancement.', icon: <Sparkles size={18} /> },
      { id: 'normalization', name: 'Normalization', desc: 'Scales pixel intensities.', icon: <Zap size={18} /> },
    ]
  },
  {
    name: 'Filters & Smoothing',
    techniques: [
      { id: 'gaussian_blur', name: 'Gaussian Blur', desc: 'Standard noise reduction.', icon: <Filter size={18} /> },
      { id: 'median_blur', name: 'Median Filter', desc: 'Best for salt-and-pepper noise.', icon: <Filter size={18} /> },
      { id: 'bilateral_filter', name: 'Bilateral', desc: 'Edge-preserving smoothing.', icon: <Filter size={18} /> },
      { id: 'sharpening', name: 'Sharpening', desc: 'Enhances fine details.', icon: <Sparkles size={18} /> },
    ]
  },
  {
    name: 'Segmentation & Edges',
    techniques: [
      { id: 'thresholding', name: 'Thresholding', desc: 'Basic binary conversion.', icon: <Filter size={18} /> },
      { id: 'otsu', name: 'Otsu Binarization', desc: 'Automatic optimal threshold.', icon: <Filter size={18} /> },
      { id: 'adaptive_thresholding', name: 'Adaptive Thresh', desc: 'Best for uneven lighting.', icon: <Filter size={18} /> },
      { id: 'edge_detection', name: 'Canny Edges', desc: 'Highlights structural borders.', icon: <Filter size={18} /> },
    ]
  },
  {
    name: 'Morphology & Geometry',
    techniques: [
      { id: 'erosion', name: 'Erosion', desc: 'Shrinks foreground objects.', icon: <Scissors size={18} /> },
      { id: 'dilation', name: 'Dilation', desc: 'Expands foreground objects.', icon: <Sparkles size={18} /> },
      { id: 'opening', name: 'Opening', desc: 'Erosion then Dilation.', icon: <Scissors size={18} /> },
      { id: 'closing', name: 'Closing', desc: 'Dilation then Erosion.', icon: <Sparkles size={18} /> },
      { id: 'rotation', name: 'Auto-Rotation', desc: 'Corrects document orientation.', icon: <RotateCcw size={18} /> },
      { id: 'padding', name: 'Padding', desc: 'Adds protective borders.', icon: <ImageIcon size={18} /> },
    ]
  }
];

const PreprocessingOptions = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState(['resizing', 'grayscale']);

  const toggleTechnique = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="options-container glass-panel fade-in-up">
      <div className="options-header">
        <Settings className="header-icon" />
        <h2>Configure Preprocessing</h2>
        <p>Select the enhancement techniques to apply before verification.</p>
      </div>

      <div className="categories-stack">
        {categories.map(cat => (
          <div key={cat.name} className="category-group">
            <h3>{cat.name}</h3>
            <div className="techniques-grid">
              {cat.techniques.map(tech => (
                <div 
                  key={tech.id} 
                  className={`tech-card ${selected.includes(tech.id) ? 'selected' : ''}`}
                  onClick={() => toggleTechnique(tech.id)}
                >
                  <div className="tech-icon-wrapper">{tech.icon}</div>
                  <div className="tech-info">
                    <h4>{tech.name}</h4>
                    <p>{tech.desc}</p>
                  </div>
                  <div className="checkbox">
                    {selected.includes(tech.id) && <Check size={14} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="options-footer">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button 
          className="btn btn-primary" 
          disabled={selected.length === 0}
          onClick={() => onNext(selected)}
        >
          Run Extraction & Verify
        </button>
      </div>
    </div>
  );
};

export default PreprocessingOptions;
