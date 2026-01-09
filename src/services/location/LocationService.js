import laravelApi from "@/services/laravelApi";
import laravelApp from "@/services/laravelApp";

export async function fetchLocation(company, location = null) {
    try {
        const res = await laravelApi.get(`/client/${company}/venues/${location}`);

        // Check if the response status is not OK (e.g., 404, 500)
        if (res.status !== 200) {
            throw new Error('Location not found');
        }

        // Return the data from the API response
        return res.data;

    } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error("Error fetching location data:", error);
        // Return null or a fallback value in case of an error
        return null;
    }
}

export async function fetchCompanyLocations(company) {
    try {
        const res = await laravelApi.get(`/client/${company}/locations`);

        // Check if the response status is not OK (e.g., 404, 500)
        if (res.status !== 200) {
            throw new Error('No Location not found');
        }

        // Return the data from the API response
        return res.data;

    } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error("Error fetching location data:", error);
        // Return null or a fallback value in case of an error
        return null;
    }

}

export async function fetchLocations() {
    try {
        const res = await laravelApp.get(`client/locations`);

        // Check if the response status is not OK (e.g., 404, 500)
        if (res.status !== 200) {
            throw new Error('No Location not found');
        }

        // Return the data from the API response
        return res.data;

    } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error("Error fetching location data:", error);
        // Return null or a fallback value in case of an error
        return null;
    }
}
