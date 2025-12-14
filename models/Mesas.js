import { DataTypes } from "sequelize";
import db from "../config/db.js";

/**
 * Modelo de Espacio Comedor
 * Representa las mesas o espacios disponibles en el restaurante
 * Incluye información sobre capacidad, ubicación y disponibilidad
 */
const EspacioComedor = db.define(
    "mesas",
    {
        // Nombre identificador del espacio (ej: "Mesa 1", "VIP 3")
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // Capacidad máxima de personas que puede acomodar
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        // Zona o área donde se encuentra el espacio
        // Valores posibles: "interior", "terraza", "barra", "privado"
        zona: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // Estado de disponibilidad del espacio
        estado: {
            type: DataTypes.ENUM("activa", "inactiva"),
            allowNull: false,
            defaultValue: "activa",
        },
    },
);

// Exportar el modelo para su uso en otros módulos
export default EspacioComedor;