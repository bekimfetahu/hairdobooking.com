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
            if (!credential) return NextResponse.json({ message: 'Missing credential' }, { status: 400 });

            // Verify the ID token with Google's tokeninfo endpoint
            const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
            if (!tokenInfoRes.ok) {
                const txt = await tokenInfoRes.text();
                throw new Error(`Invalid Google token: ${txt}`);
            }
            const info = await tokenInfoRes.json();

            const expectedAud = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (expectedAud && info.aud !== expectedAud) {
                return NextResponse.json({ message: 'Invalid Google token audience' }, { status: 401 });
            }

            const fallbackName = splitName(info.name || info.email);
            userData = {
                email: info.email,
                first_name: info.given_name || fallbackName.first_name,
                last_name: info.family_name || fallbackName.last_name,
                avatar: info.picture,
                social_id: info.sub,
                phone: '',
            };
        } else if (provider === 'facebook') {
            if (!accessToken) return NextResponse.json({ message: 'Missing accessToken' }, { status: 400 });

            const fbAppId = process.env.FACEBOOK_CLIENT_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
            const fbAppSecret = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

            // If we have app credentials, validate the token first
            if (fbAppId && fbAppSecret) {
                const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${fbAppId}|${fbAppSecret}`);
                const debugJson = await debugRes.json();
                if (!debugJson.data || !debugJson.data.is_valid || String(debugJson.data.app_id) !== String(fbAppId)) {
                    return NextResponse.json({ message: 'Invalid Facebook token' }, { status: 401 });
                }
            }

            const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`);
            const fbData = await fbRes.json();
            userData = {
                email: fbData.email,
                first_name: fbData.first_name,
                last_name: fbData.last_name,
                avatar: fbData.picture?.data?.url || fbData.picture,
                social_id: fbData.id,
                phone: fbData.phone ?? '',
            };
        } else {
            return NextResponse.json({ message: 'Unsupported provider' }, { status: 400 });
        }

        const response = await laravelApp.post(`/client/auth/social-login/${provider}`, userData);
        const data = await response.data;

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

        console.error('Social login error:', { message, status, responseData, error });

        return NextResponse.json(
            {
                message,
                details: responseData?.errors || responseData,
            },
            { status }
        );
    }
}
