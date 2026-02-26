import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { generateHTMLTemplate } from '@/lib/pdf/htmlTemplate';
import { validatePaperData, calculateMarks } from '@/lib/pdf';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

async function generatePDFWithGotenberg(html: string): Promise<Buffer> {
  const gotenbergUrl = process.env.GOTENBERG_URL;
  if (!gotenbergUrl) {
    throw new Error('GOTENBERG_URL not set');
  }

  const formData = new FormData();
  formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');

  const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) {
    throw new Error(`Gotenberg error: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

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
  isPremium?: boolean;
  includeAnswerSheet?: boolean;
  syllabus?: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
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

interface PDFRequest {
  settings: PDFSettings;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `pdf_${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetIn: record.resetAt - now };
}

const ALLOWED_ORIGINS = [
  'https://paperpress.vercel.app',
  'https://paperpressapp.vercel.app',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:3000',
];

function getAllowedOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.PDF_API_KEY;
  
  if (!validKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 401 }
    );
  }
  
  if (apiKey !== validKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body: PDFRequest = await request.json();
    const { settings, mcqs, shorts, longs } = body;

    const validation = validatePaperData(
      {
        instituteName: settings.instituteName,
        subject: settings.subject,
        classId: settings.classId,
        date: settings.date,
        timeAllowed: settings.timeAllowed,
        title: settings.examType || 'Exam',
      },
      mcqs || [],
      shorts || [],
      longs || []
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    const totalQuestions = (mcqs?.length || 0) + (shorts?.length || 0) + (longs?.length || 0);
    if (totalQuestions > 100) {
      return NextResponse.json({ error: 'Too many questions. Maximum 100 allowed.' }, { status: 400 });
    }

    const paperData = {
      instituteName: settings.instituteName,
      logoUrl: settings.instituteLogo,
      date: settings.date || new Date().toISOString().split('T')[0],
      timeAllowed: settings.timeAllowed || '2 Hours',
      classId: settings.classId,
      subject: settings.subject,
      examType: settings.examType,
      mcqs: mcqs || [],
      shorts: shorts || [],
      longs: longs || [],
      customHeader: settings.customHeader,
      customSubHeader: settings.customSubHeader,
      showLogo: settings.showLogo,
      isPremium: settings.isPremium,
      includeAnswerSheet: settings.includeAnswerSheet !== false,
      attemptRules: settings.attemptRules,
      customMarks: settings.customMarks,
      syllabus: settings.syllabus,
      instituteAddress: settings.instituteAddress,
      instituteEmail: settings.instituteEmail,
      institutePhone: settings.institutePhone,
      instituteWebsite: settings.instituteWebsite,
    };

    const html = generateHTMLTemplate(paperData);
    const pdfBuffer = await generatePDFWithGotenberg(html);
    const allowedOrigin = getAllowedOrigin(request);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${settings.classId}_${settings.subject}_${settings.date}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Access-Control-Allow-Origin': allowedOrigin,
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('[PDF Generation Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}

export async function OPTIONS(request: NextRequest) {
  const allowedOrigin = getAllowedOrigin(request);
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
