/**
 * Stub file - Puppeteer PDF generation is no longer used
 * Downloads now use iframe + window.print() for both web and Android
 */

export async function generatePDF(_paperData: any): Promise<Buffer> {
  throw new Error('Puppeteer PDF is no longer supported. Use iframe + window.print() instead.');
}
