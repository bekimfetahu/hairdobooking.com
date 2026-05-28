// laravelApp/laravelApi/auth/me/route.js

import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function GET(req) {
    const token = await req.cookies.get('token'); // Retrieve token from cookie
    console.log('token', token)

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await laravelApi.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${token.value}`, // Send token to backend for validation
            },
        });
        console.log('Response from /auth/me:', response.data);
        return NextResponse.json({ user: response.data }, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid token or user session expired.' },
            { status: 401 }
        );
    }
}
