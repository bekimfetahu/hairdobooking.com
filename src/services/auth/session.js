export async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data?.user ?? null;
    } catch (error) {
        console.error('Failed to refresh authenticated user:', error);
        return null;
    }
}

