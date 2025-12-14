import { ProgramaAtencion } from "../models/index.js";

/**
 * Valida si una fecha y hora están dentro del horario de atención del restaurante
 * 
 * @param {string} fecha - Fecha de la reserva
 * @param {string} hora - Hora de la reserva
 * @returns {Promise<boolean>} - true si está en horario, false si no
 */
const validarHorarioAtencion = async (fecha, hora) => {
    // Obtener día de la semana de 0-6    // Usamos T00:00:00 para asegurar que la fecha se interprete localmente y obtener el día correcto
    const fechaObj = new Date(`${fecha}T00:00:00`);
    const diaSemana = fechaObj.getDay();

    const horarioDia = await ProgramaAtencion.findOne({
        where: {
            dia_semana: diaSemana,
            activo: true
        }
    });

    if (!horarioDia) return false;

    // Verificar rango de horas
    const horaApertura = horarioDia.hora_apertura.substring(0, 5); // HH:MM
    const horaCierre = horarioDia.hora_cierre.substring(0, 5); // HH:MM

    // Validar que la hora esté dentro del rango
    // Permitimos reservas hasta antes del cierre
    return hora >= horaApertura && hora < horaCierre;
};

export { validarHorarioAtencion };
