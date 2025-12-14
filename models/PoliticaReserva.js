import { DataTypes } from "sequelize";
import db from "../config/db.js";

/**
 * Modelo de Reglas de Reservación
 * Define las políticas y restricciones para las reservas del restaurante
 * Incluye tiempos de cancelación, anticipación y límites de personas
 */
const ReglasReservacion = db.define("politicas_reserva", {
    // Identificador único de las reglas
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Tiempo mínimo (en minutos) antes de la reserva para poder cancelar
    tiempo_cancelacion_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60 // 1 hora por defecto
    },

    // Tiempo mínimo (en horas) de anticipación para crear una reserva
    tiempo_anticipacion_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // 1 hora por defecto
    },

    // Número máximo de personas permitidas por reserva
    max_personas_por_reserva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20 // 20 personas por defecto
    },

    // Duración predeterminada (en minutos) de una reserva
    duracion_default_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90 // 1 hora y 30 minutos por defecto
    }
});

// Exportar el modelo para su uso en otros módulos
export default ReglasReservacion;