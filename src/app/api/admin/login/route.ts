import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@paperpress.app';
    const adminPassword = process.env.ADMIN_PASSWORD || 'PaperPress2024Admin!';

    console.log("Login attempt - email:", email);
    console.log("Expected email:", adminEmail);
    console.log("Expected password:", adminPassword);

    if (email === adminEmail && password === adminPassword) {
      const token = crypto.randomBytes(32).toString('hex');
      
      return NextResponse.json({
        success: true,
        token,
        admin: {
          email: adminEmail,
          name: 'Admin'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
