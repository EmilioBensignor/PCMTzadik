
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    // Productos
    PRODUCTOS: '/productos',
    PRODUCTOS_CREAR: '/productos/crear',
    PRODUCTOS_EDITAR: (id) => `/productos/crear?edit=${id}`,
    PRODUCTOS_CATEGORIA: (nombre) => `/productos/${encodeURIComponent(nombre)}`
};