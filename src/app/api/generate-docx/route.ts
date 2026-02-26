import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { generateDOCX } from '@/lib/pdf/docxGenerator';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface DOCXRequest {
    settings: {
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
    };
    mcqs: MCQQuestion[];
    shorts: ShortQuestion[];
    longs: LongQuestion[];
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
    try {
        const body: DOCXRequest = await request.json();
        const { settings, mcqs, shorts, longs } = body;

        const docxBlob = await generateDOCX(settings, mcqs, shorts, longs);
        const buffer = Buffer.from(await docxBlob.arrayBuffer());

        const allowedOrigin = getAllowedOrigin(request);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${settings.classId}_${settings.subject}.docx"`,
                'Access-Control-Allow-Origin': allowedOrigin,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'DOCX generation failed' },
            { status: 500 }
        );
    }
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
