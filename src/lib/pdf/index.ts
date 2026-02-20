/**
 * PDF Library Index
 * 
 * Exports all PDF-related functions for paper generation.
 */

export { generatePaperPDF, generateFilename, downloadPDF } from "./generator";
export { printPaper, generatePaperHTML, generatePDFFilename } from "./printer";
export type { PrintResult, PaperData as PrintPaperData } from "./printer";
export type { PDFSettings } from "./htmlGenerator";
export { generateHTMLTemplate } from "./htmlTemplate";
export type { PaperData } from "./htmlTemplate";
