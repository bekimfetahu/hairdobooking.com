// src/laravelApp/c/[company]/[location]/page.js

import ImageSlider from "@/components/ui/ImageSlider";
import { notFound } from "next/navigation";

export default async function LocationPage({params}) {
    const {company, location} = params; // ✅ no await here

      // Fetch the location data
     const data = {
         url: `client/locations`,
         access_type: `app`,
     }
    const locationData = await fetch('api', {
        method: 'GET',
        body: JSON.stringify(data),
    })

    // If not found, trigger 404 page
    if (!locationData) {
        notFound();
    }

    return (
        <main className="w-full bg-gray-50 py-8">
            <div className="mx-auto px-4">
                <h2 className="text-xl font-semibold mb-4">
                    {locationData?.location.name ?? ""}
                </h2>
                <ImageSlider/>
            </div>
        </main>
    );
}
