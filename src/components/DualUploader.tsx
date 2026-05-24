import React, { useCallback } from 'react';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import './DualUploader.css';

interface DualUploaderProps {
  onImageUpload: (file: File) => void;
  onPdfUpload: (file: File) => void;
  targetImage: File | null;
  pdfDocument: File | null;
  onStartSearch: () => void;
}

export const DualUploader: React.FC<DualUploaderProps> = ({
  onImageUpload,
  onPdfUpload,
  targetImage,
  pdfDocument,
  onStartSearch,
}) => {
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

      <div className="action-container">
        <button
          className="btn-primary"
          disabled={!pdfDocument || !targetImage}
          onClick={onStartSearch}
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
