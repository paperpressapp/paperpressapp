'use client';

import { useState } from 'react';
import { usePDFGenerator, downloadPDF, openPDFInNewTab } from '@/hooks/usePDFGenerator';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface PDFButtonProps {
  settings: {
    instituteName: string;
    instituteLogo?: string | null;
    examType: string;
    date: string;
    timeAllowed: string;
    classId: string;
    subject: string;
  };
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
  variant?: 'primary' | 'secondary';
  showPreview?: boolean;
}

export function PDFButton({
  settings,
  mcqs,
  shorts,
  longs,
  variant = 'primary',
  showPreview = true
}: PDFButtonProps) {
  const { generatePDF, loading, error, progress } = usePDFGenerator();
  const [showOptions, setShowOptions] = useState(false);

  const handleGenerate = async (action: 'download' | 'preview') => {
    const blob = await generatePDF(settings, mcqs, shorts, longs);
    
    if (blob) {
      const filename = `${settings.classId}_${settings.subject}_${settings.date}.pdf`;
      
      if (action === 'download') {
        downloadPDF(blob, filename);
      } else {
        openPDFInNewTab(blob);
      }
    }
    
    setShowOptions(false);
  };

  const baseStyles = 'font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 border border-gray-300'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={loading}
        className={`${baseStyles} ${variantStyles[variant]} min-w-[140px]`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm">{progress || 'Generating...'}</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>

      {showOptions && !loading && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-50">
          <button
            onClick={() => handleGenerate('download')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save to Device
          </button>
          
          {showPreview && (
            <button
              onClick={() => handleGenerate('preview')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview in New Tab
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 min-w-[200px] z-50">
          <p className="font-medium">Failed to generate PDF</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            onClick={() => window.print()}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try browser print instead
          </button>
        </div>
      )}
    </div>
  );
}
