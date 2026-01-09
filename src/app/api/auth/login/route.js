// laravelApp/laravelApi/auth/login/route.js
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // Call Laravel API using the centralized Axios instance
        const response = await laravelApp.post('/client/login', {
            email,
            password,
        });

        // Store the token in an HttpOnly cookie
        const res = NextResponse.json(response.data, { status: 200 });
        res.headers.set(
            'Set-Cookie',
            `token=${response.data.token}; Path=/; HttpOnly; Secure; SameSite=Strict`
        );

        return res;
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'An error occurred.';

        // Forward the original Laravel message and status
        return NextResponse.json(
            { message },
            { status }
        );
    }
}
