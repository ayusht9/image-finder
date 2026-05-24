import React from 'react';
import { PdfViewer } from './PdfViewer';
import { Sidebar } from './Sidebar';
import type { MatchResult } from '../utils/cv';
import './Workspace.css';

interface WorkspaceProps {
  targetImage: File;
  targetImageElement: HTMLImageElement | null;
  pdfDocument: File;
  isProcessing: boolean;
  progress: number;
  matches: MatchResult[];
  currentPageIndex: number;
  totalPages: number;
  onPageRendered: (canvas: HTMLCanvasElement, pageIndex: number) => void;
  setTotalPages: (total: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageIndex: number) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  targetImage,
  targetImageElement,
  pdfDocument,
  isProcessing,
  progress,
  matches,
  currentPageIndex,
  totalPages,
  onPageRendered,
  setTotalPages,
  onPrevPage,
  onNextPage,
  onGoToPage
}) => {
  return (
    <div className="workspace-container">
      <div className="canvas-section">
        <PdfViewer
          pdfDocument={pdfDocument}
          matches={matches}
          currentPageIndex={currentPageIndex}
          onPageRendered={onPageRendered}
          totalPages={totalPages}
          setTotalPages={setTotalPages}
        />
      </div>
      <div className="sidebar-section">
        <Sidebar
          targetImage={targetImage}
          targetImageElement={targetImageElement}
          isProcessing={isProcessing}
          progress={progress}
          matches={matches}
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onGoToPage={onGoToPage}
        />
      </div>
    </div>
  );
};
