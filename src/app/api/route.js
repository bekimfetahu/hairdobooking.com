/**
 * Laravel Proxy Handler (/laravelApi)
 *
 * This endpoint forwards frontend requests to the Laravel backend.
 * It uses a single POST method and supports GET, POST, PUT, PATCH, DELETE, and multipart/form-data.
 * Used to securely proxy requests without exposing Laravel credentials or tokens.
 *
 * Expected body:
 * {
 *   method: 'get' | 'post' | 'put' | 'patch' | 'delete',
 *   access_type: 'laravelApi' | 'laravelApp',
 *   url: '/laravel/endpoint',
 *   data: { ... } or FormData
 * }
 *
 * Example usage:
 * await fetch('/laravelApi', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     method: 'get',
 *     access_type: 'laravelApp',
 *     url: 'client/locations',
 *     data: { page: 1 }
 *   })
 * });
 */
import { NextResponse } from 'next/server';
import laravelApp from '@/services/laravelApp';
import laravelApi from '@/services/laravelApi';

export async function POST(req) {
    try {

        const contentType = req.headers.get('content-type') || '';
        const isMultipart = contentType.includes('multipart/form-data');

        let method = 'post';
        let accessType = 'laravelApi';
        let url = '';
        let payload;

        if (isMultipart) {
            payload = await req.formData();
            method = req.headers.get('x-method') || 'post';
            accessType = req.headers.get('x-access-type') || 'laravelApi';
            url = req.headers.get('x-url');
        } else {
            const body = await req.json();
            console.log(body)
            method = (body.method || 'post').toLowerCase();
            accessType = body.access_type;
            url = body.url;
            payload = body.data || {};
        }

        const errors = validateMeta({ method, accessType, url });
        if (errors.length) {
            return NextResponse.json({ message: errors.join(', ') }, { status: 422 });
        }

        console.log('url', url)
        console.log(payload)

        const token = req.cookies.get('token')?.value;
        const clientIp = getClientIp(req);
        const service = accessType === 'laravelApp' ? laravelApp : laravelApi;

        const config = {
            headers: {
                'X-Forwarded-For': clientIp,
                ...(accessType === 'laravelApi' && token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),
            },
        };

        let response;

        if (method === 'get') {
            response = await service.get(url, { params: payload, ...config });
        } else if (method === 'delete') {
            response = await service.delete(url, { data: payload, ...config });
        } else {

            // response = await laravelApp.post(url, payload, config)
            response = await service[method](url, payload, config);
            console.log('response',response.data)
        }

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('error from laravel', error);
        return handleError(error);
    }
}

// ─────────────────────────────────────────────────────────────
// 🧩 Helper: Extract Client IP
function getClientIp(req) {
    const forwarded = req.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

// 🧩 Helper: Validate Metadata
function validateMeta({ method, accessType, url }) {
    const errors = [];

    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        errors.push('Invalid method');
    }

    if (!['laravelApi', 'laravelApp'].includes(accessType)) {
        errors.push('access_type must be either "laravelApi" or "laravelApp"');
    }

    if (!url || typeof url !== 'string' || url.trim() === '') {
        errors.push('Laravel endpoint URL is required');
    }

    return errors;
}

// 🧩 Helper: Error Handler
function handleError(error) {
    if (error?.type === 'validation') {
        return NextResponse.json({ message: error.messages.join(', ') }, { status: 422 });
    }

    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Unexpected error occurred.' };
    return NextResponse.json(data, { status });
}
