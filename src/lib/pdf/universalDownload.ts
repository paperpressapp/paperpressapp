/**
 * Universal Download Entry Point
 * 
 * Single function to generate PDF on any platform using iframe + window.print().
 * SAME code for both Android and Web.
 * 
 * Usage:
 * import { downloadPerfectPaper } from '@/lib/pdf/universalDownload';
 * await downloadPerfectPaper(paperData);
 */

import { showLoading, updateLoadingMessage, hideLoading, showToast, showError, showSuccessToast } from '@/lib/loading';
import { generateHTMLTemplate, type PaperData } from './htmlTemplate';

/**
 * Download Perfect Paper
 * 
 * Generates and prints a professional PDF paper using iframe + window.print().
 * Works identically on both Android and Web platforms.
 * 
 * @param paperData - The paper data object containing all paper information
 * @param options - Optional configuration
 */
export async function downloadPerfectPaper(
  paperData: PaperData,
  options?: {
    /** Custom filename (without extension) */
    filename?: string;
    /** Callback when download completes */
    onComplete?: (success: boolean) => void;
  }
): Promise<void> {
  console.log('[PaperPress] Starting PDF download...');
  
  try {
    // Step 1: Show loading message
    showLoading('Setting up your paper...');
    
    // Step 2: Get HTML from existing generator (EXACT current format)
    updateLoadingMessage('Generating questions and layout...');
    const html = generateHTMLTemplate(paperData);
    console.log(`[PaperPress] HTML generated (${(html.length / 1024).toFixed(1)} KB)`);
    
    // Step 3: Create hidden iframe
    updateLoadingMessage('Preparing print preview...');
    const iframe = createHiddenIframe();
    document.body.appendChild(iframe);
    
    // Step 4: Write HTML to iframe
    updateLoadingMessage('Loading paper content...');
    await writeHTMLToIframe(iframe, html);
    console.log('[PaperPress] HTML written to iframe');
    
    // Step 5: Wait for fonts and styles
    updateLoadingMessage('Applying fonts and styling...');
    await delay(800);
    
    // Step 6: Hide loading
    hideLoading();
    
    // Step 7: Call iframe.contentWindow.print()
    const printed = triggerPrint(iframe);
    
    // Step 8: Show toast "Select Save as PDF"
    if (printed) {
      showSuccessToast('Print dialog opened! Select "Save as PDF" to download');
      console.log('[PaperPress] Print dialog opened successfully');
    } else {
      showToast('Print dialog could not be opened. Please try again.');
    }
    
    // Step 9: Clean up after 5 seconds
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      console.log('[PaperPress] Iframe cleaned up');
    }, 5000);
    
    if (options?.onComplete) {
      options.onComplete(true);
    }
    
    console.log('[PaperPress] PDF download complete');
    
  } catch (error) {
    console.error('[PaperPress] PDF download failed:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    showError(`Failed to generate PDF: ${errorMessage}`);
    
    if (options?.onComplete) {
      options.onComplete(false);
    }
    
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function createHiddenIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border: none;
    visibility: hidden;
  `;
  iframe.setAttribute('aria-hidden', 'true');
  return iframe;
}

function writeHTMLToIframe(iframe: HTMLIFrameElement, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!doc) {
        reject(new Error('Could not access iframe document'));
        return;
      }
      
      doc.open();
      doc.write(html);
      doc.close();
      
      resolve();
      
    } catch (error) {
      reject(error);
    }
  });
}

function triggerPrint(iframe: HTMLIFrameElement): boolean {
  try {
    const contentWindow = iframe.contentWindow;
    
    if (!contentWindow) {
      console.error('[PaperPress] No content window for iframe');
      return false;
    }
    
    contentWindow.focus();
    contentWindow.print();
    
    return true;
    
  } catch (error) {
    console.error('[PaperPress] Error triggering print:', error);
    return false;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Export
// ============================================================================

export default {
  downloadPerfectPaper,
};
