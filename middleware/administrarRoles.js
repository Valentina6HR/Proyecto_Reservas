/**
 * Middleware para validar permisos por rol de usuario
 * Verifica que el usuario autenticado tenga uno de los roles permitidos
 * 
 * @param {...string} rolesAutorizados - Lista de roles permitidos para acceder
 * @returns {Function} Middleware de Express para validar roles
 */
const validarPermisosPorRol = (...rolesAutorizados) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.usuario) {
            return res.redirect("/acceso/ingresar");
        }

        // Verificar que el rol del usuario esté en la lista de roles autorizados
        if (!rolesAutorizados.includes(req.usuario.rol)) {
            // Usuario no tiene permisos, redirigir con mensaje de error
            req.flash('error', 'No tienes permisos para acceder a esta sección.');
            return res.redirect("/");
        }

        // Usuario tiene permisos, continuar
        next();
    };
};

// Exportar el middleware
export default validarPermisosPorRol;