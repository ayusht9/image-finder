// Declare cv object from global window
declare global {
  interface Window {
    cv: any;
    cvLoaded: boolean;
  }
}

export interface MatchResult {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  pageIndex: number;
}

export const waitForOpenCV = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.cvLoaded && window.cv) {
      resolve();
      return;
    }
    
    let attempts = 0;
    const check = setInterval(() => {
      if (window.cvLoaded && window.cv) {
        clearInterval(check);
        resolve();
      } else if (attempts > 50) { // 5 seconds
        clearInterval(check);
        reject(new Error("OpenCV failed to load."));
      }
      attempts++;
    }, 100);
  });
};

/**
 * Searches for a target image within a source image (rendered PDF page) using OpenCV Template Matching.
 * @param sourceCanvas The canvas containing the rendered PDF page.
 * @param targetImageElement The img element containing the uploaded target image.
 * @param pageIndex The index of the current page.
 * @param threshold The confidence threshold (0 to 1). Default is 0.8.
 * @returns Array of MatchResults if found.
 */
export const findImageInCanvas = async (
  sourceCanvas: HTMLCanvasElement,
  targetImageElement: HTMLImageElement,
  pageIndex: number,
  threshold: number = 0.65
): Promise<MatchResult[]> => {
  await waitForOpenCV();
  const cv = window.cv;

  let src = null;
  let originalTempl = null;
  let mask = new cv.Mat();
  const matches: MatchResult[] = [];

  try {
    src = cv.imread(sourceCanvas);
    originalTempl = cv.imread(targetImageElement);

    // Convert both to grayscale for simpler/faster matching
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.cvtColor(originalTempl, originalTempl, cv.COLOR_RGBA2GRAY, 0);

    let bestMaxVal = -1;
    let bestMatchPoint = null;
    let bestScale = 1;

    // Calculate the exact ratio of the target image to the source canvas
    // This is critical for matching "full-page screenshots" perfectly
    const exactScale = Math.min(src.cols / originalTempl.cols, src.rows / originalTempl.rows);

    // Multi-scale template matching 
    const scales = new Set([0.3, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5, exactScale, exactScale * 0.98]);
    const sortedScales = Array.from(scales).sort((a, b) => a - b);

    for (const scale of sortedScales) {
      // Yield to the browser's event loop to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 0));

      let scaledWidth = Math.round(originalTempl.cols * scale);
      let scaledHeight = Math.round(originalTempl.rows * scale);
      
      // Clamp to source dimensions to avoid 1-pixel rounding overflows that crash OpenCV
      if (scaledWidth > src.cols) scaledWidth = src.cols;
      if (scaledHeight > src.rows) scaledHeight = src.rows;

      // Ensure template is not too small
      if (scaledWidth < 5 || scaledHeight < 5) {
        continue;
      }

      let templ = new cv.Mat();
      let dsize = new cv.Size(scaledWidth, scaledHeight);
      cv.resize(originalTempl, templ, dsize, 0, 0, cv.INTER_AREA);

      let dst = new cv.Mat();
      // Remove mask, it's not needed for TM_CCOEFF_NORMED and can cause issues
      cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED);

      let minMax = cv.minMaxLoc(dst);
      
      if (minMax.maxVal > bestMaxVal) {
        bestMaxVal = minMax.maxVal;
        bestMatchPoint = minMax.maxLoc;
        bestScale = scale;
      }

      templ.delete();
      dst.delete();
    }

    if (bestMaxVal >= threshold && bestMatchPoint) {
      matches.push({
        x: bestMatchPoint.x,
        y: bestMatchPoint.y,
        width: Math.round(originalTempl.cols * bestScale),
        height: Math.round(originalTempl.rows * bestScale),
        confidence: bestMaxVal,
        pageIndex
      });
    }

    return matches;
  } catch (error) {
    console.error("OpenCV Match Error:", error);
    return [];
  } finally {
    if (src) src.delete();
    if (originalTempl) originalTempl.delete();
    mask.delete();
  }
};
