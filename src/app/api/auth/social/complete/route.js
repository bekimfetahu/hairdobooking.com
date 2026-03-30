import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const token = body?.token;
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

        const isProduction = process.env.NODE_ENV === 'production';
        const response = NextResponse.json({ success: true });
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('Failed to set token cookie', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
