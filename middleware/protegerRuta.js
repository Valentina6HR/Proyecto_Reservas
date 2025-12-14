import jwt from "jsonwebtoken";
import { CuentaUsuario } from "../models/index.js";

/**
 * Middleware para verificar que el usuario tiene acceso autorizado
 * Valida el token JWT y verifica que el usuario esté activo
 * 
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const verificarAccesoAutorizado = async (req, res, next) => {
  // Extraer el token de las cookies
  const { _token } = req.cookies;

  // Si no hay token, redirigir al login
  if (!_token) {
    return res.redirect("/acceso/ingresar");
  }

  // Intentar validar el token
  try {
    // Decodificar el token JWT
    const informacionDecodificada = jwt.verify(_token, process.env.JWT_SECRETA);

    // Buscar el usuario en la base de datos
    const cuentaUsuario = await CuentaUsuario.findByPk(informacionDecodificada.id);

    // Verificar que el usuario existe, está activo y el token coincide
    if (cuentaUsuario && cuentaUsuario.estado === "activo" && cuentaUsuario.token === _token) {
      // Eliminar la contraseña antes de asignar a req.usuario
      const { password, ...datosUsuarioSinCredencial } = cuentaUsuario.toJSON();
      req.usuario = datosUsuarioSinCredencial;

      // Continuar con la siguiente función
      return next();
    } else {
      // Token inválido o usuario inactivo, limpiar cookie y redirigir
      return res.clearCookie("_token").redirect("/acceso/ingresar");
    }
  } catch (error) {
    // Error al verificar el token, limpiar cookie y redirigir
    return res.clearCookie("_token").redirect("/acceso/ingresar");
  }
};

// Exportar el middleware
export default verificarAccesoAutorizado;
