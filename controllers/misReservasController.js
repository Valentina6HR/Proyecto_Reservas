import { ReservaRestaurante, CuentaUsuario, EspacioComedor } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Visualiza las Reservas del usuario autenticado
 */
const visualizarReservasUsuario = async (req, res) => {
    try {
        const ReservasDelUsuario = await ReservaRestaurante.findAll({
            where: { id_usuario: req.usuario.id },
            order: [["fecha_reserva", "DESC"], ["hora_inicio", "DESC"]],
            include: [
                { model: EspacioComedor, as: "Mesa", attributes: ["nombre", "zona"] }
            ]
        });

        res.render("usuario/mis-reservas", {
            pagina: "Mis Reservas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            Reservas: ReservasDelUsuario
        });
    } catch (error) {
        console.error("Error al visualizar Reservas del usuario:", error);
        res.render("usuario/mis-reservas", {
            pagina: "Mis Reservas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al cargar tus Reservas" }],
            Reservas: []
        });
    }
};

/**
 * Cancela una Reserva del usuario
 */
const cancelarReservaUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const ReservaEncontrada = await ReservaRestaurante.findByPk(id);

        if (!ReservaEncontrada) {
            req.flash('error', 'Reserva no encontrada');
            return res.redirect("/mis-reservas");
        }

        // Verificar que la Reserva pertenezca al usuario
        if (ReservaEncontrada.id_usuario !== req.usuario.id) {
            req.flash('error', 'No tienes permiso para cancelar esta Reserva');
            return res.redirect("/mis-reservas");
        }

        // Verificar que la Reserva no esté ya cancelada o completada
        if (ReservaEncontrada.estado === "cancelada" || ReservaEncontrada.estado === "completada") {
            req.flash('error', 'Esta Reserva no se puede cancelar');
            return res.redirect("/mis-reservas");
        }

        // Cancelar la Reserva
        await ReservaEncontrada.update({ estado: "cancelada" });
        req.flash('exito', 'Reserva cancelada exitosamente');
        res.redirect("/mis-reservas");
    } catch (error) {
        console.error("Error al cancelar Reserva:", error);
        req.flash('error', 'Error al cancelar la Reserva');
        res.redirect("/mis-reservas");
    }
};

// Exportar funciones del controlador
export {
    visualizarReservasUsuario,
    cancelarReservaUsuario
};
