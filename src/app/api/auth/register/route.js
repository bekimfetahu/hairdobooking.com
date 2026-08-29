// laravelApp/laravelApi/auth/login/route.js
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
    try {
        const body = await req.json();
        const isProduction = process.env.NODE_ENV === 'production';

        const response = await laravelApp.post('/client/register', body);

        const res = NextResponse.json(response.data, { status: 200 });
        res.headers.set(
            'Set-Cookie',
            `token=${response.data.token}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax`
        );

        return res;
    } catch (error) {
        const status = error.response?.status || 500;
        console.log('error',error)

        // Laravel always returns message + errors for 422
        const message = error.response?.data?.message || 'An error occurred.';
        const errors = error.response?.data?.errors || {};

        return NextResponse.json(
            {
                status,
                message,
                errors
            },
            { status }
        );
    }
}
