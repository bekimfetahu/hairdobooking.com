
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';

export async function POST(req) {
    console.log('trial laravelApi')
    try {
        const body = await req.json();

        // Call Laravel laravelApp using the centralized Axios instance
        const response = await laravelApp.post('laravelApp/owner/trial', body);



        // Store the token in an HttpOnly cookie
        const res = NextResponse.json(response.data, { status: 200 });

        console.log('res', response.data)

        return res;
    } catch (error) {
        console.log('error',error)
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'An error occurred.';

        // Forward the original Laravel message and status
        return NextResponse.json(
            { message },
            { status }
        );
    }
}
