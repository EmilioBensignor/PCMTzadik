export const useSupabaseCache = () => {
    const getFromCache = (key) => {
        try {
            const cachedData = localStorage.getItem(key);
            if (!cachedData) return null;

            const { data, expiry } = JSON.parse(cachedData);
            if (Date.now() > expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error al recuperar datos de cache:', error);
            localStorage.removeItem(key);
            return null;
        }
    };

    const saveToCache = (key, data, ttlMinutes = 60) => {
        try {
            const expiry = Date.now() + (ttlMinutes * 60 * 1000);
            localStorage.setItem(key, JSON.stringify({ data, expiry }));
        } catch (error) {
            console.error('Error al guardar en cache:', error);
        }
    };

    const cacheAuthSession = (session) => {
        if (!session) return;

        try {
            const sessionData = {
                access_token: session.access_token,
                expires_at: session.expires_at,
                user_id: session.user.id,
                email: session.user.email
            };

            const ttlMinutes = (session.expires_at - Math.floor(Date.now() / 1000)) / 60 * 0.9;
            saveToCache('auth_session_cache', sessionData, ttlMinutes);
        } catch (error) {
            console.error('Error al cachear sesión:', error);
        }
    };

    const getAuthSession = () => {
        return getFromCache('auth_session_cache');
    };

    const clearAuthCache = () => {
        localStorage.removeItem('auth_session_cache');
    };

    return {
        getFromCache,
        saveToCache,
        cacheAuthSession,
        getAuthSession,
        clearAuthCache
    };
};