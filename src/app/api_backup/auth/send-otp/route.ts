import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const OTP_STORE: Map<string, { otp: string; expiresAt: number; attempts: number }> = new Map();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [key, value] of OTP_STORE.entries()) {
    if (value.expiresAt < now) {
      OTP_STORE.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanupExpiredOTPs();
    
    const body = await request.json();
    const { email, fullName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Rate limiting: Max 3 OTP requests per email per 10 minutes
    const existingOTP = OTP_STORE.get(normalizedEmail);
    if (existingOTP && existingOTP.attempts >= 3 && existingOTP.expiresAt > Date.now()) {
      return NextResponse.json({ 
        error: 'Too many requests. Please wait before requesting a new code.' 
      }, { status: 429 });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP server-side
    OTP_STORE.set(normalizedEmail, {
      otp,
      expiresAt,
      attempts: (existingOTP?.attempts || 0) + 1,
    });

    const resend = getResendClient();
    
    // If no Resend API key, return OTP in development (for testing)
    if (!resend) {
      console.log('[DEV MODE] OTP for', email, ':', otp);
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'OTP generated (check server console)',
          devOtp: otp, // Only in development
          expiresIn: 600,
        });
      }
      return NextResponse.json({ 
        error: 'Email service not configured. Please contact support.' 
      }, { status: 503 });
    }

    const { error } = await resend.emails.send({
      from: 'PaperPress <noreply@darulfalah.site>',
      to: email,
      subject: 'Your PaperPress Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; text-align: center; }
            .logo { width: 64px; height: 64px; background: linear-gradient(135deg, #1E88E5, #1565C0); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
            .logo span { color: white; font-size: 28px; font-weight: bold; }
            .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E88E5; margin: 24px 0; }
            .footer { margin-top: 24px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo"><span>P</span></div>
            <h1 style="margin: 0; color: #333;">Verify Your Email</h1>
            <p style="color: #666; margin-top: 8px;">Enter this code to complete your signup:</p>
            <div class="otp">${otp}</div>
            <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
            <div class="footer">
              <p>If you didn't request this code, you can safely ignore this email.</p>
              <p>PaperPress - Professional Exam Paper Generator</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      OTP_STORE.delete(normalizedEmail);
      return NextResponse.json({ error: `Failed to send OTP: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedData = OTP_STORE.get(normalizedEmail);

    if (!storedData) {
      return NextResponse.json({ valid: false, error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (storedData.expiresAt < Date.now()) {
      OTP_STORE.delete(normalizedEmail);
      return NextResponse.json({ valid: false, error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (storedData.otp !== otp) {
      return NextResponse.json({ valid: false, error: 'Invalid OTP.' }, { status: 400 });
    }

    // Valid OTP - remove it
    OTP_STORE.delete(normalizedEmail);

    return NextResponse.json({ valid: true, message: 'OTP verified successfully' });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
