import { ReservaRestaurante, CuentaUsuario, EspacioComedor } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Genera un resumen de informes y estadísticas del sistema
 */
const generarResumenInformes = async (req, res) => {
    try {
        // Estadísticas generales
        const totalReservas = await ReservaRestaurante.count();
        const ReservasPorEstado = await ReservaRestaurante.findAll({
            attributes: [
                'estado',
                [ReservaRestaurante.sequelize.fn('COUNT', ReservaRestaurante.sequelize.col('estado')), 'cantidad']
            ],
            group: ['estado']
        });

        // Reservas por zona
        const ReservasPorZona = await ReservaRestaurante.findAll({
            include: [{
                model: EspacioComedor,
                as: "Mesa",
                attributes: ['zona']
            }],
            attributes: [
                [ReservaRestaurante.sequelize.fn('COUNT', ReservaRestaurante.sequelize.col('id_reserva')), 'cantidad']
            ],
            group: ['Mesa.zona']
        });

        // Reservas recientes
        const ReservasRecientes = await ReservaRestaurante.findAll({
            limit: 20,
            order: [["createdAt", "DESC"]],
            include: [
                { model: CuentaUsuario, as: "Usuario", attributes: ["nombre", "email"] },
                { model: EspacioComedor, as: "Mesa", attributes: ["nombre", "zona"] }
            ]
        });

        res.render("panel/reportes", {
            pagina: "Informes y Reportes",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            estadisticas: {
                totalReservas,
                ReservasPorEstado,
                ReservasPorZona
            },
            ReservasRecientes
        });
    } catch (error) {
        console.error("Error al generar informes:", error);
        res.render("panel/reportes", {
            pagina: "Informes y Reportes",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al generar los informes" }]
        });
    }
};

// Exportar funciones del controlador
export {
    generarResumenInformes
};