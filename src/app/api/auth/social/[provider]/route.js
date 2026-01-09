import { jwtDecode } from 'jwt-decode';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import laravelApp from '@/services/laravelApp';

export async function POST(req, context) {
    const { provider } = context.params;
    const { credential, accessToken } = await req.json();

    let userData;

    try {
        if (provider === 'google') {
            const decoded = jwtDecode(credential);
            userData = {
                email: decoded.email,
                first_name: decoded.given_name,
                last_name: decoded.family_name,
                avatar: decoded.picture,
                social_id: decoded.sub,
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
            secure: true,
            sameSite: 'strict',
            path: '/',
        });


        return NextResponse.json(data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Social login failed';

        console.error('Laravel error:', message);

        return NextResponse.json({ message }, { status });
    }
}
