// Password reset - send reset link to email
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
    try {
        const body = await req.json();

        // Call Laravel password reset endpoint
        const response = await laravelApp.post('/client/forgot-password', body);

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || {};
        const message = data.message || 'An error occurred.';
        const errors = data.errors || null;

        return NextResponse.json(
            { message, errors },
            { status }
        );
    }
}
