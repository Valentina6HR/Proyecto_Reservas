import { body } from "express-validator";

/**
 * Reglas de validación para la reprogramación de reservas
 * Verifica que la nueva fecha no sea pasada y el formato sea correcto
 */
const validarDatosReprogramacion = [
    // Validar fecha
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

            // Comparar fechas: No permitir reagendar para el pasado
            if (valorFecha < fechaActualStr) {
                throw new Error("No puedes reagendar para una fecha pasada");
            }
            return true;
        }),

    // Validar hora
    body("hora_inicio")
        .notEmpty()
        .withMessage("La hora es obligatoria")
];

export { validarDatosReprogramacion };
