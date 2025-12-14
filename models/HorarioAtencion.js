import { DataTypes } from "sequelize";
import db from "../config/db.js";

/**
 * Modelo de Programa de Atención
 * Define los horarios de operación del restaurante por día de la semana
 */
const ProgramaAtencion = db.define(
    "horarios_atencion",
    {
        // Identificador único del horario
        id_horario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        // Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
        dia_semana: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        // Hora de apertura del restaurante
        hora_apertura: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        // Hora de cierre del restaurante
        hora_cierre: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        // Indica si el horario está activo
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }
);

// Exportar el modelo para su uso en otros módulos
export default ProgramaAtencion;