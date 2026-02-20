import { registerPlugin } from '@capacitor/core';

export interface PDFPrinterPlugin {
  printToPDF(options: PrintToPDFOptions): Promise<PrintToPDFResult>;
}

export interface PrintToPDFOptions {
  html: string;
  filename: string;
}

export interface PrintToPDFResult {
  success: boolean;
  message: string;
  jobName?: string;
}

const PDFPrinter = registerPlugin<PDFPrinterPlugin>('PDFPrinter');

export default PDFPrinter;
