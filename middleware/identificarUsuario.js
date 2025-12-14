import jwt from "jsonwebtoken";
import CuentaUsuario from "../models/Usuarios.js";

/**
 * Middleware para reconocer la sesión activa del usuario
 * Identifica al usuario autenticado sin forzar el login
 * 
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const reconocerSesionActiva = async (req, res, next) => {
    // Extraer el token de las cookies
    const { _token } = req.cookies;

    // Si no hay token, continuar sin usuario
    if (!_token) {
        req.usuario = null;
        return next();
    }

    // Intentar identificar al usuario mediante el token
    try {
        // Decodificar el token JWT
        const informacionDecodificada = jwt.verify(_token, process.env.JWT_SECRETA);

        // Buscar el usuario en la base de datos
        const cuentaUsuario = await CuentaUsuario.findByPk(informacionDecodificada.id);

        // Verificar que el usuario existe, está activo y el token coincide con el de la BD
        if (cuentaUsuario && cuentaUsuario.estado === "activo" && cuentaUsuario.token === _token) {
            // Eliminar la contraseña antes de asignar a req.usuario
            const { password, ...datosUsuarioSinCredencial } = cuentaUsuario.toJSON();
            req.usuario = datosUsuarioSinCredencial;
        } else {
            // Token inválido, establecer usuario como null
            req.usuario = null;
            // Limpiar cookie si el token no es válido
            res.clearCookie("_token");
        }

        return next();
    } catch (error) {
        // Error al verificar el token
        req.usuario = null;
        res.clearCookie("_token");
        return next();
    }
};

// Exportar el middleware
export { reconocerSesionActiva };
