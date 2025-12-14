import { DataTypes } from "sequelize";
import db from "../config/db.js";

/**
 * Modelo de Parámetros del Establecimiento
 * Almacena la configuración general del restaurante
 */
const ParametrosEstablecimiento = db.define(
  "configuracion_restaurante",
  {
    // Identificador único de la configuración
    id_config: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Nombre del restaurante
    nombre_restaurante: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Dirección física del establecimiento
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Número de teléfono de contacto
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Email para recibir notificaciones del sistema
    email_notificaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Duración estándar (en minutos) de una reserva
    duracion_estandar_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120, // 2 horas por defecto
    },

    // Intervalo (en minutos) entre franjas horarias de reserva
    intervalo_reservas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // 30 minutos por defecto
    },

    // Máximo de reservas permitidas por franja horaria
    max_reservas_por_franga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },

    // Tiempo máximo (en minutos) antes de la reserva para cancelar
    tiempo_max_cancelacion_antes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120, // 2 horas por defecto
    },

    // Tiempo máximo (en minutos) de tolerancia para retraso
    tiempo_max_retraso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15, // 15 minutos por defecto
    },
  },
  {
    timestamps: true,
  }
);

// Exportar el modelo para su uso en otros módulos
export default ParametrosEstablecimiento;