import { jwtDecode } from 'jwt-decode';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import laravelApp from '@/services/laravelApp';

const splitName = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return {
        first_name: parts[0] || '',
        last_name: parts.slice(1).join(' '),
    };
};

export async function POST(req, context) {
    const { provider } = await context.params;
    const { credential, accessToken } = await req.json();
    const isProduction = process.env.NODE_ENV === 'production';

    let userData;

    try {
        if (provider === 'google') {
            const decoded = jwtDecode(credential);
            const fallbackName = splitName(decoded.name || decoded.email);
            userData = {
                email: decoded.email,
                first_name: decoded.given_name || fallbackName.first_name,
                last_name: decoded.family_name || fallbackName.last_name,
                avatar: decoded.picture,
                social_id: decoded.sub,
                phone: '',
            };
        }

        if (provider === 'facebook') {
            const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`);
            const fbData = await fbRes.json();
            userData = {
                email: fbData.email,
                first_name: fbData.first_name,
                last_name: fbData.last_name,
                avatar: fbData.picture?.data?.url,
                social_id: fbData.id,
                phone: fbData.phone ?? '',
            };
        }



        const response = await laravelApp.post(`/client/auth/social-login/${provider}`, userData);
        const data = await response.data;

        console.log(data)

        const cookieStore = await cookies(); // ✅ Await cookies()
        cookieStore.set({
            name: 'token',
            value: data.token,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/',
        });


        return NextResponse.json(data);
    } catch (error) {
        const status = error.response?.status || 500;
        const responseData = error.response?.data;
        const message = responseData?.message || responseData?.error || error.message || 'Social login failed';

        console.error('Laravel error:', {
            message,
            status,
            responseData,
        });

        return NextResponse.json(
            {
                message,
                details: responseData?.errors || responseData,
            },
            { status }
        );
    }
}
