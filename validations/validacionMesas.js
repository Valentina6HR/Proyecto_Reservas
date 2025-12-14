// Importaciones necesarias
import { body } from "express-validator";

/**
 * Reglas de validación para la gestión de espacios (mesas)
 * Define las restricciones para crear/editar espacios
 */
const validarDatosEspacio = [
    // Validar nombre del espacio
    body("nombre")
        .notEmpty()
        .withMessage("El nombre del espacio es obligatorio")
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

    // Validar capacidad (Máximo 20 personas - CRÍTICO PARA SEGURIDAD)
    body("capacidad")
        .notEmpty()
        .withMessage("La capacidad es obligatoria")
        .isInt({ min: 1, max: 20 })
        .withMessage("La capacidad debe ser entre 1 y 20 personas. Por seguridad no se permiten grupos mayores."),

    // Validar zona
    body("zona")
        .notEmpty()
        .withMessage("La zona es obligatoria")
        .isIn(['interior', 'terraza', 'barra', 'privado'])
        .withMessage("Zona no válida"),

    // Validar estado
    body("estado")
        .optional()
        .isIn(['activa', 'inactiva'])
        .withMessage("Estado no válido")
];

export { validarDatosEspacio };
