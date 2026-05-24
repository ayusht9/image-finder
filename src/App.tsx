import { useState, useEffect, useCallback } from 'react';
import { DualUploader } from './components/DualUploader';
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

  const handleStartSearch = async () => {
    if (!targetImage || !pdfDocument) return;

    try {
      await waitForOpenCV();
    } catch (error) {
      alert("OpenCV failed to load. Please check your internet connection or disable ad blockers blocking the CDN.");
      return;
    }

    setIsSearching(true);
    setIsProcessing(true);
    setProgress(0);
    setMatches([]);
    setCurrentPageIndex(0); // Start rendering from page 0
  };

  // Called when PdfViewer finishes rendering a page to canvas
  const handlePageRendered = useCallback(async (canvas: HTMLCanvasElement, pageIndex: number) => {
    if (!isProcessing || !targetImageElement) return;

    try {
      // Find matches on this page
      const pageMatches = await findImageInCanvas(canvas, targetImageElement, pageIndex);
      
      if (pageMatches.length > 0) {
        setMatches(prev => [...prev, ...pageMatches]);
      }
    } catch (error) {
      console.error("Error matching on page", pageIndex, error);
    }

    // Move to next page if scanning, else finish
    if (pageIndex < totalPages - 1) {
      setProgress((pageIndex + 1) / totalPages);
      setCurrentPageIndex(pageIndex + 1);
    } else {
      setProgress(1);
      setIsProcessing(false);
      
      // If we found matches, go to the first match
      setMatches(prevMatches => {
        if (prevMatches.length > 0) {
          setCurrentPageIndex(prevMatches[0].pageIndex);
        } else {
          // just go back to page 0 if nothing found
          setCurrentPageIndex(0);
        }
        return prevMatches;
      });
    }
  }, [isProcessing, targetImageElement, totalPages]);

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
        />
      )}
    </div>
  );
}

export default App;
