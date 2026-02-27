/**
 * Perfect Android PDF Implementation
 * 
 * Uses iframe + window.print() for native Android printing.
 * This is simpler and more reliable than the native PDFPrinter plugin.
 * 
 * Flow:
 * 1. Show loading message
 * 2. Generate HTML using existing htmlTemplate
 * 3. Create hidden iframe
 * 4. Write HTML to iframe
 * 5. Wait for fonts to load
 * 6. Trigger print dialog
 * 7. Show user instructions
 */

import { showLoading, updateLoadingMessage, hideLoading, showToast, showError } from '@/lib/loading';
import { generateHTMLTemplate, type PaperData } from '../htmlTemplate';

interface AndroidPrintOptions {
  filename?: string;
  onComplete?: (printed: boolean) => void;
}

// Re-export PaperData type
export type { PaperData };

/**
 * Generate and print PDF on Android using native print dialog
 */
export async function generatePerfectAndroidPDF(
  paperData: PaperData,
  options: AndroidPrintOptions = {}
): Promise<void> {
  const { filename, onComplete } = options;
  
  console.log('[PaperPress] Starting Android PDF generation...');
  
  try {
    // Step 1: Show loading
    showLoading('Preparing your professional paper...');
    console.log('[PaperPress] Step 1: Loading shown');
    
    // Step 2: Generate HTML
    updateLoadingMessage('Generating paper layout...');
    console.log('[PaperPress] Step 2: Generating HTML...');
    
    const html = generateHTMLTemplate(paperData);
    console.log(`[PaperPress] HTML generated (${(html.length / 1024).toFixed(1)} KB)`);
    
    // Step 3: Create hidden iframe
    updateLoadingMessage('Loading paper...');
    console.log('[PaperPress] Step 3: Creating iframe...');
    
    const iframe = createHiddenIframe();
    document.body.appendChild(iframe);
    
    // Step 4: Write HTML to iframe
    updateLoadingMessage('Formatting paper...');
    console.log('[PaperPress] Step 4: Writing HTML to iframe...');
    
    await writeHTMLToIframe(iframe, html);
    console.log('[PaperPress] HTML written to iframe');
    
    // Step 5: Wait for fonts and resources
    updateLoadingMessage('Loading fonts...');
    console.log('[PaperPress] Step 5: Waiting for fonts...');
    
    await delay(1500); // Wait for fonts to load
    
    // Step 6: Hide loading and trigger print
    hideLoading();
    console.log('[PaperPress] Step 6: Triggering print dialog...');
    
    // Trigger print
    const printed = triggerPrint(iframe);
    
    if (printed) {
      showToast('📄 Select "Save as PDF" in the print dialog');
      console.log('[PaperPress] Print dialog opened successfully');
    } else {
      showToast('Print dialog could not be opened');
      console.log('[PaperPress] Print dialog not opened');
    }
    
    // Cleanup iframe after delay
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      console.log('[PaperPress] Iframe cleaned up');
    }, 5000);
    
    // Call completion callback
    if (onComplete) {
      onComplete(printed);
    }
    
    console.log('[PaperPress] Android PDF generation complete');
    
  } catch (error) {
    console.error('[PaperPress] Error generating PDF:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showError(`Failed to generate PDF: ${errorMessage}`);
    
    if (onComplete) {
      onComplete(false);
    }
  }
}

/**
 * Create a hidden iframe for printing
 */
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

/**
 * Write HTML content to iframe
 */
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
      
      // Resolve immediately - content is written
      resolve();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Trigger the print dialog
 */
function triggerPrint(iframe: HTMLIFrameElement): boolean {
  try {
    const contentWindow = iframe.contentWindow;
    
    if (!contentWindow) {
      console.error('[PaperPress] No content window for iframe');
      return false;
    }
    
    // Call print on the iframe's window
    contentWindow.focus();
    contentWindow.print();
    
    return true;
    
  } catch (error) {
    console.error('[PaperPress] Error triggering print:', error);
    return false;
  }
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Export
// ============================================================================

export default {
  generatePerfectAndroidPDF,
};
