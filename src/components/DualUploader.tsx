import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Settings } from 'lucide-react';
import './DualUploader.css';

export interface SearchSettings {
  threshold: number;
  scaleStrategy: 'exact' | 'balanced' | 'deep';
  colorMatch: boolean;
  startPage?: number;
  endPage?: number;
}

interface DualUploaderProps {
  onImageUpload: (file: File) => void;
  onPdfUpload: (file: File) => void;
  targetImage: File | null;
  pdfDocument: File | null;
  onStartSearch: (settings: SearchSettings) => void;
}

export const DualUploader: React.FC<DualUploaderProps> = ({
  onImageUpload,
  onPdfUpload,
  targetImage,
  pdfDocument,
  onStartSearch,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SearchSettings>({
    threshold: 0.65,
    scaleStrategy: 'balanced',
    colorMatch: false,
  });

  const handleImageFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onImageUpload(e.target.files[0]);
      }
    },
    [onImageUpload]
  );

  const handlePdfFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onPdfUpload(e.target.files[0]);
      }
    },
    [onPdfUpload]
  );

  return (
    <div className="dual-uploader-container">
      <div className="upload-panels">
        {/* PDF Upload Panel */}
        <div className={`uploader-panel glass-panel ${pdfDocument ? 'has-file' : ''}`}>
          <input
            type="file"
            id="pdf-upload"
            className="file-input"
            accept="application/pdf"
            onChange={handlePdfFileInput}
          />
          <label htmlFor="pdf-upload" className="uploader-content">
            <div className="icon-container">
              <FileText size={48} className={pdfDocument ? 'text-success' : 'upload-icon'} />
            </div>
            <h3 className={pdfDocument ? 'text-success' : 'text-gradient'}>
              {pdfDocument ? 'PDF Selected' : 'Upload PDF Document'}
            </h3>
            <p className="text-muted">
              {pdfDocument ? pdfDocument.name : 'Click to select the document to search inside'}
            </p>
          </label>
        </div>

        {/* Target Image Upload Panel */}
        <div className={`uploader-panel glass-panel ${targetImage ? 'has-file' : ''}`}>
          <input
            type="file"
            id="image-upload"
            className="file-input"
            accept="image/*"
            onChange={handleImageFileInput}
          />
          <label htmlFor="image-upload" className="uploader-content">
            <div className="icon-container">
              <ImageIcon size={48} className={targetImage ? 'text-success' : 'upload-icon'} />
            </div>
            <h3 className={targetImage ? 'text-success' : 'text-gradient'}>
              {targetImage ? 'Target Image Selected' : 'Upload Target Image'}
            </h3>
            <p className="text-muted">
              {targetImage ? targetImage.name : 'Click to select the image to look for'}
            </p>
          </label>
        </div>
      </div>

      <div className="settings-toggle">
        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={18} />
          {showSettings ? 'Hide Advanced Settings' : 'Advanced Settings'}
        </button>
      </div>

      {showSettings && (
        <div className="advanced-settings-panel glass-panel">
          <div className="settings-grid">
            <div className="setting-group">
              <label>Confidence Threshold: {Math.round(settings.threshold * 100)}%</label>
              <input 
                type="range" 
                min="0.4" 
                max="0.99" 
                step="0.01" 
                value={settings.threshold} 
                onChange={(e) => setSettings({...settings, threshold: parseFloat(e.target.value)})}
                className="range-slider"
              />
              <p className="setting-hint">Lower finds compressed/fuzzy images; Higher requires exact matches.</p>
            </div>

            <div className="setting-group">
              <label>Scale Strategy</label>
              <select 
                value={settings.scaleStrategy}
                onChange={(e) => setSettings({...settings, scaleStrategy: e.target.value as any})}
                className="settings-select"
              >
                <option value="exact">Exact Size Only (Fastest)</option>
                <option value="balanced">Balanced Multi-Scale (Recommended)</option>
                <option value="deep">Deep Search (Slowest, robust size changes)</option>
              </select>
              <p className="setting-hint">How to handle target images that are resized in the PDF.</p>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.colorMatch}
                  onChange={(e) => setSettings({...settings, colorMatch: e.target.checked})}
                />
                Strict Color Matching (RGB)
              </label>
              <p className="setting-hint">Uncheck to match purely on structure (Grayscale), which is faster and ignores minor color shifts.</p>
            </div>

            <div className="setting-group">
              <label>Page Range (Optional)</label>
              <div className="page-range-inputs">
                <input 
                  type="number" 
                  placeholder="Start Page" 
                  min="1"
                  className="page-input"
                  onChange={(e) => setSettings({...settings, startPage: e.target.value ? parseInt(e.target.value) : undefined})}
                />
                <span>to</span>
                <input 
                  type="number" 
                  placeholder="End Page" 
                  min="1"
                  className="page-input"
                  onChange={(e) => setSettings({...settings, endPage: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>
              <p className="setting-hint">Leave blank to search all pages.</p>
            </div>
          </div>
        </div>
      )}

      <div className="action-container">
        <button
          className="btn-primary"
          disabled={!pdfDocument || !targetImage}
          onClick={() => onStartSearch(settings)}
        >
          <UploadCloud size={20} />
          Start Search
        </button>
        {(!pdfDocument || !targetImage) && (
          <p className="helper-text text-muted">Please upload both files to begin.</p>
        )}
      </div>
    </div>
  );
};
