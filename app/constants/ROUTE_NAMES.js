
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    PRODUCTOS_CREAR: '/productos/crear',
    PRODUCTOS_EDITAR: (id) => `/productos/edit/${id}`,
    PRODUCTOS_CATEGORIA: (nombre) => `/productos/${encodeURIComponent(nombre)}`,
    EDITOR_MASIVO: '/editor-masivo',
    // Reviews
    REVIEWS: '/reviews',
    REVIEWS_CREAR: '/reviews/crear',
    REVIEWS_EDITAR: (id) => `/reviews/edit/${id}`
};