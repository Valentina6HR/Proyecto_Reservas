import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import db from "../config/db.js";

/**
 * Modelo de Cuenta de Usuario
 * Representa a los usuarios del sistema con diferentes roles y permisos
 * Incluye funcionalidad de autenticación y gestión de sesiones
 */
const CuentaUsuario = db.define(
    "usuarios",
    {
        // Nombre completo del usuario
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // Correo electrónico único para autenticación
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        // Contraseña encriptada del usuario
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // Rol del usuario en el sistema (determina permisos)
        rol: {
            type: DataTypes.ENUM("admin", "recepcionista", "mesero", "cliente"),
            allowNull: false,
        },

        // Número de teléfono de contacto (opcional)
        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // Notas adicionales sobre el usuario
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // Estado de la cuenta (activo/inactivo)
        estado: {
            type: DataTypes.ENUM("activo", "inactivo"),
            defaultValue: "activo",
        },

        // Token de autenticación o recuperación de contraseña
        token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        // Hooks del modelo para procesar datos antes de guardar
        hooks: {
            /**
             * Hook que se ejecuta antes de guardar un usuario
             * Encripta la contraseña si ha sido modificada
             */
            beforeSave: async (cuentaUsuario) => {
                // Verificar si la contraseña fue modificada
                if (cuentaUsuario.changed("password")) {
                    console.log("Hook beforeSave: Encriptando credencial de acceso...");
                    console.log("Credencial antes de encriptar:", cuentaUsuario.password.substring(0, 10) + "...");

                    // Generar salt para el hash
                    const salParaHash = await bcrypt.genSalt(10);

                    // Encriptar la contraseña con bcrypt
                    cuentaUsuario.password = await bcrypt.hash(cuentaUsuario.password, salParaHash);

                    console.log("Credencial encriptada:", cuentaUsuario.password.substring(0, 20) + "...");
                }
            },
        },

        // Scopes para consultas predefinidas
        scopes: {
            // Scope para excluir información sensible
            eliminarPassword: {
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"],
                },
            },
        },
    }
);

/**
 * Método personalizado para validar la contraseña del usuario
 * Compara la contraseña proporcionada con la almacenada (encriptada)
 * 
 * @param {string} credencialIngresada - Contraseña en texto plano a verificar
 * @returns {boolean} True si la contraseña es correcta, false en caso contrario
 */
CuentaUsuario.prototype.validarCredencial = function (credencialIngresada) {
    // Comparar la contraseña ingresada con la almacenada usando bcrypt
    return bcrypt.compareSync(credencialIngresada, this.password);
};

// Exportar el modelo para su uso en otros módulos
export default CuentaUsuario;