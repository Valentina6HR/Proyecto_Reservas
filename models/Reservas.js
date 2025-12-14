import { DataTypes } from "sequelize";
import db from "../config/db.js";

/**
 * Modelo de Cita de Restaurante
 * Representa las reservaciones realizadas por los clientes
 * Incluye información del cliente, mesa asignada, horarios y estado
 */
const ReservaRestaurante = db.define(
    "reservas",
    {
        // Identificador único de la cita
        id_reserva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        // ID del usuario que realiza la reserva
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        // ID de la mesa asignada (puede ser null inicialmente)
        id_mesa: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        // Nombre del cliente desde el formulario
        nombre_cliente: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // Email del cliente desde el formulario
        email_cliente: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // Teléfono del cliente desde el formulario
        telefono_cliente: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // Fecha de la reservación
        fecha_reserva: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        // Hora de inicio de la cita
        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        // Hora de finalización de la cita (calculada automáticamente)
        hora_fin: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        // Cantidad de personas para la reserva
        numero_personas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
        },

        // Estado actual de la reservación
        estado: {
            type: DataTypes.ENUM(
                "pendiente",
                "confirmada",
                "en_curso",
                "completada",
                "cancelada",
                "no_show"
            ),
            allowNull: false,
            defaultValue: "pendiente",
        },

        // Canal por el cual se realizó la reserva
        canal: {
            type: DataTypes.ENUM("web", "telefono", "presencial"),
            allowNull: false,
        },

        // Observaciones o peticiones especiales del cliente
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // ID del usuario que creó la reserva (puede ser diferente al cliente)
        creado_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        // Tipo de dispositivo desde el que se realizó la reserva
        dispositivo: {
            type: DataTypes.ENUM("mobile", "desktop", "tablet"),
            allowNull: true,
            defaultValue: "desktop",
        },
    },
    {
        // Hooks del modelo para procesar datos automáticamente
        hooks: {
            /**
             * Hook que se ejecuta antes de crear una nueva cita
             * Calcula automáticamente la hora de finalización si no se proporciona
             */
            beforeCreate: (reservaRestaurante) => {
                // Verificar si no se ha establecido hora de finalización
                if (!reservaRestaurante.hora_fin) {
                    // Extraer horas y minutos de la hora de inicio
                    const [horasInicio, minutosInicio] = reservaRestaurante.hora_inicio
                        .split(":")
                        .map(Number);

                    // Crear objeto Date para calcular la hora final
                    const momentoFinalizacion = new Date();
                    momentoFinalizacion.setHours(horasInicio, minutosInicio, 0);

                    // Agregar duración por defecto: 90 minutos (1 hora y 30 minutos)
                    momentoFinalizacion.setMinutes(momentoFinalizacion.getMinutes() + 90);

                    // Formatear la hora de finalización en formato HH:MM:SS
                    const horasFin = momentoFinalizacion.getHours().toString().padStart(2, "0");
                    const minutosFin = momentoFinalizacion.getMinutes().toString().padStart(2, "0");

                    reservaRestaurante.hora_fin = `${horasFin}:${minutosFin}:00`;
                }
            },
        },
    }
);

// Exportar el modelo para su uso en otros módulos
// Exportar el modelo para su uso en otros módulos
export default ReservaRestaurante;
