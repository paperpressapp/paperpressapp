import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { generatePreviewHTML, validatePaperData, calculateMarks } from '@/lib/pdf';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  showLogo?: boolean;
  isPremium?: boolean;
  includeAnswerSheet?: boolean;
  attemptRules?: {
    shortAttempt?: number;
    shortTotal?: number;
    longAttempt?: number;
    longTotal?: number;
  };
  customMarks?: {
    mcq?: number;
    short?: number;
    long?: number;
  };
}

interface PreviewRequest {
  settings: PDFSettings;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { settings, mcqs, shorts, longs } = body;

    const validation = validatePaperData(
      {
        instituteName: settings.instituteName,
        subject: settings.subject,
        classId: settings.classId,
        date: settings.date,
        timeAllowed: settings.timeAllowed,
        title: 'Preview',
      },
      mcqs || [],
      shorts || [],
      longs || []
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors, warnings: validation.warnings },
        { status: 400 }
      );
    }

    const marks = calculateMarks(mcqs || [], shorts || [], longs || [], settings.attemptRules, settings.customMarks);

    const html = generatePreviewHTML({
      instituteName: settings.instituteName,
      logoUrl: settings.instituteLogo,
      date: settings.date || new Date().toISOString().split('T')[0],
      timeAllowed: settings.timeAllowed || '2 Hours',
      classId: settings.classId,
      subject: settings.subject,
      mcqs: mcqs || [],
      shorts: shorts || [],
      longs: longs || [],
      customHeader: settings.customHeader,
      showLogo: settings.showLogo,
      showBubbles: settings.includeAnswerSheet !== false,
      attemptRules: settings.attemptRules,
      customMarks: settings.customMarks,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Total-Marks': String(marks.total),
        'X-Page-Estimate': String(Math.ceil((mcqs?.length || 0) * 0.15 + (shorts?.length || 0) * 0.08 + (longs?.length || 0) * 0.12 + 1)),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Preview generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}
