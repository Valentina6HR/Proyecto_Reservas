import CuentaUsuario from "./Usuarios.js";
import EspacioComedor from "./Mesas.js";
import ReservaRestaurante from "./Reservas.js";
import ParametrosEstablecimiento from "./ConfiguracionRestaurante.js";
import ProgramaAtencion from "./HorarioAtencion.js";
import ReglasReservacion from "./PoliticaReserva.js";

/**
 * Definición de relaciones entre modelos
 */

// Un usuario puede tener múltiples reservas
ReservaRestaurante.belongsTo(CuentaUsuario, { foreignKey: "id_usuario", as: "Usuario" });
CuentaUsuario.hasMany(ReservaRestaurante, { foreignKey: "id_usuario" });

// Relación: Una reserva puede estar asignada a un espacio comedor (mesa)
// Un espacio comedor puede tener múltiples reservas a lo largo del tiempo
ReservaRestaurante.belongsTo(EspacioComedor, { foreignKey: "id_mesa", as: "Mesa" });
EspacioComedor.hasMany(ReservaRestaurante, { foreignKey: "id_mesa" });

// Relación: Una reserva fue creada por un usuario (puede ser recepcionista o admin)
// Un usuario puede haber creado múltiples reservas para otros clientes
ReservaRestaurante.belongsTo(CuentaUsuario, { foreignKey: "creado_por", as: "Creador" });
CuentaUsuario.hasMany(ReservaRestaurante, { foreignKey: "creado_por" });

// Exportar todos los modelos para su uso en la aplicación
export {
    CuentaUsuario,
    EspacioComedor,
    ReservaRestaurante,
    ParametrosEstablecimiento,
    ProgramaAtencion,
    ReglasReservacion
};