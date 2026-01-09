import { NextResponse } from 'next/server';
import laravelApi from '@/services/laravelApi';

export async function POST(req) {
    const tokenCookie = req.cookies.get('token'); // Retrieve token from cookie

    if (!tokenCookie) {
        return NextResponse.json({ message: 'Unauthorized from nextjs' }, { status: 401 });
    }

    console.log('Logging out:', tokenCookie)

    try {
        // Make the backend API call to Laravel to delete Sanctum tokens.
        // This call might fail, but we want to remove the cookie regardless.
        const response = await laravelApi.post('/client/logout', null, {
            headers: {
                Authorization: `Bearer ${tokenCookie.value}`,
            },
        });
        console.error('Logout success:', response.data);

        // Create a response using the Laravel API response
        const res = NextResponse.json(response.data, { status: 200 });

        // Set the token cookie to expire immediately.
        // Using 'expires' directive with a proper date string (here, new Date(0).toUTCString())
        res.headers.set(
            'Set-Cookie',
            `token=; Path=/; HttpOnly; Secure; SameSite=Strict; expires=${new Date(0).toUTCString()}`
        );
        return res;
    } catch (error) {
        console.error('Failed to logout:', error.response?.data);
        // Even if there is an error, we still want to remove the cookie so that the user is logged out.
        const res = NextResponse.json(
            { message: 'Invalid token or user session expired.' },
            { status: 200 } // Optionally, still return status 200 to force login, or 401 if you prefer.
        );
        res.headers.set(
            'Set-Cookie',
            `token=; Path=/; HttpOnly; Secure; SameSite=Strict; expires=${new Date(0).toUTCString()}`
        );
        return res;
    }
}
