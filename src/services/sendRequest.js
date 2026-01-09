// src/services/sendRequest.js
export async function sendRequest(endpoint, payload) {

    const domain = process.env.NEXT_PUBLIC_BACKEND_API;



    const response = await fetch(domain + '/'+ endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
}
