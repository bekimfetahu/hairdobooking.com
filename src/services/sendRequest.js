/**
 * LocationPage (Server Component)
 *
 * This page demonstrates how to call the unified `sendRequest()` helper
 * to communicate with the Laravel backend from the Next.js SERVER.
 *
 * `sendRequest()` automatically selects the correct Laravel service:
 *  - access_type: "laravelApp" → uses X-App-Token (app-to-app)
 *  - access_type: "laravelApi" → uses Sanctum cookies (logged-in user)
 *
 * Usage Example:
 *
 * const response = await sendRequest({
 *     method: "get",                // HTTP method: get, post, put, patch, delete
 *     access_type: "laravelApp",    // Which Laravel service to use
 *     api: "client/locations",      // Laravel endpoint (no domain)
 *     data: {}                      // Query params or request body
 * });
 *
 * The helper returns `response.data` directly from Laravel.
 *
 * This pattern should be used for ALL server-side requests to Laravel.
 * For client-side requests, use the Next.js API proxy (/laravelApi) instead.
 */


import laravelApp from "@/services/laravelApp";
import laravelApi from "@/services/laravelApi";

export async function sendRequest({ method, access_type, api, data }) {
    const service = access_type === "laravelApp" ? laravelApp : laravelApi;

    try {
        let response;

        if (method === "get") {
            response = await service.get(api, { params: data });
        } else if (method === "delete") {
            response = await service.delete(api, { data });
        } else {
            response = await service[method](api, data);
        }

        return response.data;

    } catch (error) {
        console.error("Laravel error:", error?.response?.data);
        throw new Error(error?.response?.data?.message || "Laravel request failed");
    }
}
