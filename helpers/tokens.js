import jwt from "jsonwebtoken";

/**
 * Genera un identificador único aleatorio para tokens de recuperación
 * 
 * @returns {string} Cadena única generada aleatoriamente
 */
const crearIdentificadorUnico = () => {
  // Generar parte aleatoria en base 32
  const parteAleatoria = Math.random().toString(32).substring(2);

  // Generar parte temporal en base 32
  const parteTemporal = Date.now().toString(32);

  // Combinar ambas partes para crear un identificador único
  return parteAleatoria + parteTemporal;
};

/**
 * Crea un token de autenticación JWT con la información del usuario
 * 
 * @param {Object} informacionUsuario - Datos del usuario a incluir en el token
 * @param {number} informacionUsuario.id - ID único del usuario
 * @param {string} informacionUsuario.nombre - Nombre del usuario
 * @returns {string} Token JWT firmado
 */
const crearTokenAutenticacion = (informacionUsuario) => {
  // Extraer datos relevantes del usuario
  const cargaUtil = {
    id: informacionUsuario.id,
    nombre: informacionUsuario.nombre
  };

  // Configuración de opciones del token
  const opcionesToken = {
    expiresIn: "1d" // El token expira en 1 día
  };

  // Firmar y retornar el token JWT
  return jwt.sign(cargaUtil, process.env.JWT_SECRETA, opcionesToken);
};

// Exportar las funciones utilitarias
export { crearTokenAutenticacion, crearIdentificadorUnico };
