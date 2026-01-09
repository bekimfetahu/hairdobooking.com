import laravelApp from "@/services/laravelApp";

export async function registerOwner(data) {
    try {
        const res = await laravelApp.post(`api/partner/register`, data);
        return res.data;

    } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error("Error fetching location data:", error);
        // Return null or a fallback value in case of an error
        return error;
    }
}
