import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';

// Service-role client — bypasses RLS, safe for server-only API routes
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
}

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Cleanup expired OTPs (fire-and-forget)
        supabase.rpc('cleanup_expired_otps').then(() => { });

        // Check existing OTP for rate limiting
        const { data: existing } = await supabase
            .from('otp_verifications')
            .select('attempts, expires_at')
            .eq('email', normalizedEmail)
            .maybeSingle();

        const now = new Date();
        const isStillValid = existing && new Date(existing.expires_at) > now;

        if (isStillValid && existing.attempts >= 3) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait before requesting a new code.' },
                { status: 429 }
            );
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Upsert OTP into Supabase — persists across serverless cold starts
        const { error: upsertError } = await supabase
            .from('otp_verifications')
            .upsert({
                email: normalizedEmail,
                otp,
                expires_at: expiresAt,
                attempts: isStillValid ? (existing.attempts + 1) : 1,
                created_at: now.toISOString(),
            });

if (upsertError) {
            logger.error('OTP upsert error:', upsertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        const resend = getResendClient();

if (!resend) {
            if (process.env.NODE_ENV === 'development') {
                logger.log('[DEV MODE] OTP for', email, ':', otp);
                return NextResponse.json({ success: true, message: 'OTP generated (check server console)', devOtp: otp, expiresIn: 600 });
            }
            return NextResponse.json({ error: 'Email service not configured.' }, { status: 503 });
        }

        const { error: sendError } = await resend.emails.send({
            from: 'PaperPress <noreply@darulfalah.site>',
            to: email,
            subject: 'Your PaperPress Verification Code',
            html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; text-align: center; }
            .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E88E5; margin: 24px 0; }
            .footer { margin-top: 24px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0; color: #333;">Verify Your Email</h1>
            <p style="color: #666; margin-top: 8px;">Enter this code to complete your signup:</p>
            <div class="otp">${otp}</div>
            <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
            <div class="footer"><p>PaperPress - Professional Exam Paper Generator</p></div>
          </div>
        </body>
        </html>
      `,
        });

        if (sendError) {
            // Roll back OTP if email failed
            await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
            return NextResponse.json({ error: `Failed to send OTP: ${sendError.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully', expiresIn: 600 });
} catch (error) {
        logger.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Fetch OTP from Supabase — works across all serverless instances
        const { data: storedData, error: fetchError } = await supabase
            .from('otp_verifications')
            .select('otp, expires_at')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (fetchError || !storedData) {
            return NextResponse.json({ valid: false, error: 'No OTP found. Please request a new one.' }, { status: 400 });
        }

        if (new Date(storedData.expires_at) < new Date()) {
            await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
            return NextResponse.json({ valid: false, error: 'OTP expired. Please request a new one.' }, { status: 400 });
        }

        if (storedData.otp !== otp) {
            return NextResponse.json({ valid: false, error: 'Invalid OTP.' }, { status: 400 });
        }

        // OTP is valid — delete it (single-use)
        await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
        return NextResponse.json({ valid: true, message: 'OTP verified successfully' });
} catch (error) {
        logger.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
