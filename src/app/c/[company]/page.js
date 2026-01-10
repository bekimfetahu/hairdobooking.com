export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Header from "@/components/layouts/Header";
import {fetchLocations} from "@/services/location/LocationService";


export default async function LocationPage({params}) {

    // Fetch the location data
    const {company } = params
    const locationData = null; //await fetchLocations(company);

    // Check if the location is not found and render a 404 message
    if (!locationData) {
        return (
            <>
                <section>
                    <h2 className="text-xl font-semibold mb-4">Location Not Found</h2>
                    <p>We could not find the requested locations.</p>
                </section>

            </>
        );
    }

    return (
        <>
            <section>
                <h2 className="text-xl font-semibold mb-4">Location: {locationData?.name??'null'}</h2>
                {/*<div>{JSON.stringify(locationData)}</div>*/}
            </section>
        </>
    );
}
