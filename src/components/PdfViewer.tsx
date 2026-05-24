import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { MatchResult } from '../utils/cv';
import './PdfViewer.css';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfDocument: File;
  matches: MatchResult[];
  currentPageIndex: number;
  onPageRendered: (canvas: HTMLCanvasElement, pageIndex: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfDocument,
  matches,
  currentPageIndex,
  onPageRendered,
  setTotalPages,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      const arrayBuffer = await pdfDocument.arrayBuffer();
      const task = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await task.promise;
      setPdfRef(pdf);
      setTotalPages(pdf.numPages);
    };
    loadPdf();
  }, [pdfDocument, setTotalPages]);

  // Render current page
  useEffect(() => {
    let isMounted = true;
    let renderTask: pdfjsLib.RenderTask | null = null;

    const renderPage = async () => {
      if (!pdfRef || !canvasRef.current) return;

      try {
        const page = await pdfRef.getPage(currentPageIndex + 1); // 1-indexed
        
        // Calculate scale to fit container width, but default to 1.5 for clarity
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Render to an offscreen canvas to prevent "Cannot use same canvas" errors
        const offscreenCanvas = document.createElement('canvas');
        const context = offscreenCanvas.getContext('2d');
        if (!context) return;

        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;

        // Fill white background! Critical for OpenCV matching against screenshots!
        // Because pdf.js leaves the background transparent, which OpenCV reads as black!
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

        renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        } as any);

        await renderTask.promise;
        
        // If still mounted, copy the offscreen canvas to the visible canvas
        if (isMounted && canvasRef.current) {
          const visibleCanvas = canvasRef.current;
          const visibleCtx = visibleCanvas.getContext('2d');
          if (visibleCtx) {
            visibleCanvas.width = offscreenCanvas.width;
            visibleCanvas.height = offscreenCanvas.height;
            visibleCtx.drawImage(offscreenCanvas, 0, 0);
            
            // Notify parent that render is complete so it can run OpenCV match
            onPageRendered(visibleCanvas, currentPageIndex);
          }
        }
      } catch (error: any) {
        if (error?.name !== 'RenderingCancelledException') {
          console.error("PDF Render Error:", error);
        }
      }
    };

    renderPage().catch(console.error);

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfRef, currentPageIndex, onPageRendered]);

  // We have a separate overlay canvas to draw matches without interfering with the PDF canvas or OpenCV reads
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !overlayRef.current) return;
    
    const overlayCanvas = overlayRef.current;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    // Match dimensions
    overlayCanvas.width = canvasRef.current.width;
    overlayCanvas.height = canvasRef.current.height;

    // Clear previous overlays
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw matches for the current page
    const pageMatches = matches.filter(m => m.pageIndex === currentPageIndex);
    
    pageMatches.forEach(match => {
      // Draw highlight background
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)'; // Yellow highlight
      ctx.fillRect(match.x, match.y, match.width, match.height);

      // Draw border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.strokeRect(match.x, match.y, match.width, match.height);
      
      // Draw confidence text
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(match.x, match.y - 24, 120, 24);
      ctx.fillStyle = '#facc15';
      ctx.font = '14px Inter';
      ctx.fillText(`Match: ${(match.confidence * 100).toFixed(1)}%`, match.x + 4, match.y - 8);
    });
  }, [matches, currentPageIndex]); // Redraw overlay when matches update

  return (
    <div className="pdf-viewer-container glass-panel" ref={containerRef}>
      <div className="pdf-canvas-wrapper">
        {/* PDF layer */}
        <canvas ref={canvasRef} className="pdf-canvas" />
        {/* Highlight layer */}
        <canvas ref={overlayRef} className="pdf-overlay" />
      </div>
    </div>
  );
};
