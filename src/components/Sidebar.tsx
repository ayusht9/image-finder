import React from 'react';
import { Loader2, Image as ImageIcon, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MatchResult } from '../utils/cv';
import './Sidebar.css';

interface SidebarProps {
  targetImage: File;
  targetImageElement: HTMLImageElement | null;
  isProcessing: boolean;
  progress: number;
  matches: MatchResult[];
  currentPageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageIndex: number) => void;
  onStopSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  targetImageElement,
  isProcessing,
  progress,
  matches,
  currentPageIndex,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onStopSearch
}) => {
  return (
    <div className="sidebar-container glass-panel">
      <div className="sidebar-section target-preview">
        <h3 className="section-title">
          <ImageIcon size={18} />
          Target Image
        </h3>
        <div className="preview-container">
          {targetImageElement ? (
            <img 
              src={targetImageElement.src} 
              alt="Target" 
              className="target-img"
            />
          ) : (
            <p className="text-muted">Loading target...</p>
          )}
        </div>
      </div>

      <div className="sidebar-section search-status">
        <h3 className="section-title">Search Status</h3>
        {isProcessing ? (
          <div className="processing-state">
            <Loader2 className="spinner" size={24} />
            <p>Scanning PDF... {Math.round(progress * 100)}%</p>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${Math.round(progress * 100)}%` }}
              ></div>
            </div>
            <button className="btn-stop mt-2" onClick={onStopSearch}>
              Stop Search
            </button>
          </div>
        ) : (
          <div className="completed-state">
            <CheckCircle className="text-success" size={24} />
            <p className="text-success">Scan Complete</p>
            <p className="text-muted text-sm">Found {matches.length} matches</p>
          </div>
        )}
      </div>

      <div className="sidebar-section page-controls">
        <h3 className="section-title">PDF Navigation</h3>
        <div className="pagination">
          <button 
            className="btn-icon" 
            disabled={currentPageIndex === 0} 
            onClick={onPrevPage}
          >
            <ChevronLeft />
          </button>
          <span>Page {totalPages > 0 ? currentPageIndex + 1 : 0} of {totalPages}</span>
          <button 
            className="btn-icon" 
            disabled={currentPageIndex >= totalPages - 1} 
            onClick={onNextPage}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="sidebar-section results-list">
        <h3 className="section-title">Results</h3>
        <div className="matches-container">
          {matches.length === 0 ? (
            <p className="text-muted empty-state text-sm">
              {isProcessing ? 'Waiting for matches...' : 'No matches found.'}
            </p>
          ) : (
            matches.map((match, i) => (
              <div 
                key={i} 
                className={`match-card ${match.pageIndex === currentPageIndex ? 'active' : ''}`}
                onClick={() => onGoToPage(match.pageIndex)}
              >
                <div className="match-header">
                  <span className="match-page">Page {match.pageIndex + 1}</span>
                  <span className="match-confidence">{(match.confidence * 100).toFixed(1)}% Match</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
