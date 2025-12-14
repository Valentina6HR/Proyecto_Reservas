// Importaciones necesarias
import { body } from "express-validator";

/**
 * Reglas de validación para el formulario de citas (reservas)
 * Define las restricciones y mensajes de error para cada campo
 */
const validarDatosCita = [
    // Validar nombre del cliente
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio"),

    // Validar correo electrónico
    body("email")
        .isEmail()
        .withMessage("Esto no parece un correo válido"),

    // Validar teléfono (solo números)
    body("telefono")
        .isNumeric()
        .withMessage("El teléfono debe contener solo números"),

    // Validar fecha de la cita
    body("fecha_reserva")
        .notEmpty()
        .withMessage("La fecha es obligatoria")
        .isISO8601()
        .withMessage("Formato de fecha inválido")
        .custom((valorFecha) => {
            // Obtener fecha actual en formato YYYY-MM-DD
            const fechaActual = new Date();
            const fechaActualStr = fechaActual.getFullYear() + '-' +
                String(fechaActual.getMonth() + 1).padStart(2, '0') + '-' +
                String(fechaActual.getDate()).padStart(2, '0');

            // Comparar fechas directamente para evitar problemas de zona horaria
            if (valorFecha < fechaActualStr) {
                throw new Error("La fecha no puede ser anterior a hoy");
            }
            return true;
        }),

    // Validar hora de inicio
    body("hora_inicio")
        .notEmpty()
        .withMessage("La hora es obligatoria"),

    // Validar número de personas (entre 1 y 20)
    body("numero_personas")
        .isInt({ min: 1, max: 20 })
        .withMessage("El número de personas debe estar entre 1 y 20"),

    // Validar zona seleccionada
    body("zona")
        .notEmpty()
        .withMessage("Debes seleccionar una zona para tu mesa")
        .isIn(['interior', 'terraza', 'barra', 'privado'])
        .withMessage("Zona no válida"),

    // Validar tipo de dispositivo (opcional)
    body("dispositivo")
        .optional()
        .isIn(['mobile', 'desktop', 'tablet'])
        .withMessage("Tipo de dispositivo inválido"),
];

// Exportar las reglas de validación
export { validarDatosCita };