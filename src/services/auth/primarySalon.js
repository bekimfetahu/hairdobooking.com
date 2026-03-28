export async function fetchPrimarySalonLocations({ search = '', perPage = 20, page = 1, signal } = {}) {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: 'get',
                access_type: 'laravelApp',
                url: 'client/locations',
                data: {
                    perPage,
                    page,
                    search,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(data?.message || 'Failed to load salons');
            return {
                items: [],
                meta: null,
            };
        }

        const raw = data?.data || [];

        // Backend now returns a flat, paginated list of VenueResource items.
        // If the older owner-grouped shape is ever returned, keep a small
        // compatibility layer that flattens it.
        let items;
        if (raw.length && Array.isArray(raw[0]?.locations)) {
            items = raw.flatMap((ownerGroup) => {
                const company = ownerGroup?.company || null;
                return (ownerGroup?.locations || []).map((location) => ({
                    ...location,
                    company,
                }));
            });
        } else {
            items = raw;
        }

        return {
            items,
            meta: data?.meta || null,
        };
    } catch (error) {
        console.error('Failed to load salon options:', error);
        return {
            items: [],
            meta: null,
        };
    }
}

export async function setPrimarySalon(venueUuid) {
    const response = await fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            method: 'put',
            access_type: 'laravelApi',
            url: `client/primary-salon/${venueUuid}`,
            data: {},
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to update primary salon');
    }

    return data;
}
