import {NextResponse} from "next/server";

import {fetchLocation} from "@/services/location/LocationService";

export async function GET(req, { params }) {
    const { slug } = params; // Get slug from the URL parameters

    // Fetch location data using the slug
    const locationData = await fetchLocation(slug);

    if (!locationData) {
        return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    // Return location data as a JSON response
    return NextResponse.json(locationData);
}
