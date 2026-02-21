import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, fullName } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase().trim(),
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName || email.split('@')[0],
            },
        });

        if (error) {
            if (error.message.includes('already been registered')) {
                return NextResponse.json(
                    { error: 'An account with this email already exists. Please login instead.' },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (!data.user) {
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            full_name: fullName || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        if (profileError) {
            console.error('Profile creation error:', profileError);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                emailConfirmed: data.user.email_confirmed_at,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
