import { useState, useEffect, useCallback } from 'react';
import { DualUploader, type SearchSettings } from './components/DualUploader';
import { Workspace } from './components/Workspace';
import { findImageInCanvas, waitForOpenCV, type MatchResult } from './utils/cv';
import { FileSearch } from 'lucide-react';

function App() {
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<File | null>(null);
  
  // HTML Image Element for the target image, used by OpenCV
  const [targetImageElement, setTargetImageElement] = useState<HTMLImageElement | null>(null);

  // Search state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [searchSettings, setSearchSettings] = useState<SearchSettings | null>(null);
  
  // PDF state
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // When target image is uploaded, create an HTMLImageElement
  useEffect(() => {
    if (!targetImage) {
      setTargetImageElement(null);
      return;
    }
    const url = URL.createObjectURL(targetImage);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setTargetImageElement(img);
    };
    return () => URL.revokeObjectURL(url);
  }, [targetImage]);

  const handleStartSearch = async (settings: SearchSettings) => {
    if (!targetImage || !pdfDocument) return;

    try {
      await waitForOpenCV();
    } catch (error) {
      alert("OpenCV failed to load. Please check your internet connection or disable ad blockers blocking the CDN.");
      return;
    }

    setSearchSettings(settings);
    setIsSearching(true);
    setIsProcessing(true);
    setProgress(0);
    setMatches([]);
    
    // Start from the user's requested start page (1-indexed to 0-indexed), or page 0
    const startPageIndex = settings.startPage ? Math.max(0, settings.startPage - 1) : 0;
    setCurrentPageIndex(startPageIndex);
  };

  // Called when PdfViewer finishes rendering a page to canvas
  const handlePageRendered = useCallback(async (canvas: HTMLCanvasElement, pageIndex: number) => {
    if (!isProcessing || !targetImageElement || !searchSettings) return;

    try {
      // Find matches on this page using advanced settings
      const pageMatches = await findImageInCanvas(
        canvas, 
        targetImageElement, 
        pageIndex,
        searchSettings.threshold,
        { scaleStrategy: searchSettings.scaleStrategy, colorMatch: searchSettings.colorMatch }
      );
      
      if (pageMatches.length > 0) {
        setMatches(prev => [...prev, ...pageMatches]);
      }
    } catch (error) {
      console.error("Error matching on page", pageIndex, error);
    }

    const startIdx = searchSettings.startPage ? Math.max(0, searchSettings.startPage - 1) : 0;
    const endIdx = searchSettings.endPage ? Math.min(totalPages - 1, searchSettings.endPage - 1) : totalPages - 1;
    const totalToScan = Math.max(1, endIdx - startIdx + 1);
    const scanned = pageIndex - startIdx + 1;

    // Move to next page if scanning within bounds
    if (pageIndex < endIdx) {
      setProgress(scanned / totalToScan);
      setCurrentPageIndex(pageIndex + 1);
    } else {
      setProgress(1);
      setIsProcessing(false);
      
      // If we found matches, go to the first match
      setMatches(prevMatches => {
        if (prevMatches.length > 0) {
          setCurrentPageIndex(prevMatches[0].pageIndex);
        } else {
          setCurrentPageIndex(startIdx);
        }
        return prevMatches;
      });
    }
  }, [isProcessing, targetImageElement, totalPages, searchSettings]);

  const handleStopSearch = () => {
    setIsProcessing(false);
    setProgress(1);
  };

  const resetState = () => {
    setTargetImage(null);
    setPdfDocument(null);
    setIsSearching(false);
    setMatches([]);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem', width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
            <FileSearch size={32} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }} className="text-gradient">
              Image in PDF Finder
            </h1>
            <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>
              Upload a PDF and a target image to find where it appears in the document.
            </p>
          </div>
        </div>
        {isSearching && (
          <button 
            onClick={resetState}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Start New Search
          </button>
        )}
      </header>

      {!isSearching ? (
        <DualUploader
          onImageUpload={setTargetImage}
          onPdfUpload={setPdfDocument}
          targetImage={targetImage}
          pdfDocument={pdfDocument}
          onStartSearch={handleStartSearch}
        />
      ) : (
        <Workspace
          targetImage={targetImage!}
          targetImageElement={targetImageElement}
          pdfDocument={pdfDocument!}
          isProcessing={isProcessing}
          progress={progress}
          matches={matches}
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          onPageRendered={handlePageRendered}
          setTotalPages={setTotalPages}
          onPrevPage={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
          onNextPage={() => setCurrentPageIndex(p => Math.min(totalPages - 1, p + 1))}
          onGoToPage={(pageIndex) => setCurrentPageIndex(pageIndex)}
          onStopSearch={handleStopSearch}
        />
      )}
    </div>
  );
}

export default App;
