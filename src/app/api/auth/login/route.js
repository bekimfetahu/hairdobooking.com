// laravelApp/laravelApi/auth/login/route.js
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        const isProduction = process.env.NODE_ENV === 'production';

        // Call Laravel API using the centralized Axios instance
        const response = await laravelApp.post('/client/login', {
            email,
            password,
        });

        // Store the token in an HttpOnly cookie
        const res = NextResponse.json(response.data, { status: 200 });
        res.headers.set(
            'Set-Cookie',
            `token=${response.data.token}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax`
        );

        return res;
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || {};
        const message = data.message || 'An error occurred.';
        const errors = data.errors || null;

        // Forward the original Laravel message, errors (for 422), and status
        return NextResponse.json(
            { message, errors },
            { status }
        );
    }
}
