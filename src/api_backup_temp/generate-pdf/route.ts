import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/pdf/puppeteerPDF';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  examType: string;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
}

interface PDFRequest {
  settings: PDFSettings;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequest = await request.json();

    const { settings, mcqs, shorts, longs } = body;

    if (!settings || !settings.instituteName) {
      return NextResponse.json(
        { error: 'Missing required settings' },
        { status: 400 }
      );
    }

    console.log('[PDF API] Generating PDF for:', settings.subject, 'Class:', settings.classId);
    console.log('[PDF API] Questions:', mcqs?.length || 0, 'MCQs,', shorts?.length || 0, 'shorts,', longs?.length || 0, 'longs');

    const paperData = {
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
      customSubHeader: settings.customSubHeader,
      showLogo: settings.showLogo,
    };

    const pdfBuffer = await generatePDF(paperData);

    console.log('[PDF API] PDF generated successfully, size:', pdfBuffer.length);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${settings.classId}_${settings.subject}_${settings.date}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
