import { NextResponse } from "next/server";
import laravelApp from "@/services/laravelApp";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const numberOfUsers = url.searchParams.get("number_of_users") || "1";
        const billingFrequency = url.searchParams.get("billing_frequency") || "month";

        const response = await laravelApp.get("/client/pricing/plan-price", {
            params: {
                number_of_users: numberOfUsers,
                billing_frequency: billingFrequency,
            },
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Unable to fetch pricing.";

        return NextResponse.json({ message }, { status });
    }
}
