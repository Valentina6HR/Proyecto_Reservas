import { CuentaUsuario, ReservaRestaurante, EspacioComedor } from "../models/index.js";
import { Op } from "sequelize";
import { validationResult } from "express-validator";
import { validarHorarioAtencion } from "../helpers/validarHorario.js";


const mostrarPanelPrincipal = async (req, res) => {
    try {
        // estadísticas
        const totalReservas = await ReservaRestaurante.count();
        const ReservasPendientes = await ReservaRestaurante.count({ where: { estado: "pendiente" } });
        const ReservasConfirmadas = await ReservaRestaurante.count({ where: { estado: "confirmada" } });
        const totalCuentas = await CuentaUsuario.count();
        const totalEspacios = await EspacioComedor.count();

        // Reservas recientes
        const ReservasRecientes = await ReservaRestaurante.findAll({
            limit: 10,
            order: [["createdAt", "DESC"]],
            include: [
                { model: CuentaUsuario, as: "Usuario", attributes: ["nombre", "email"] },
                { model: EspacioComedor, as: "Mesa", attributes: ["nombre", "zona"] }
            ]
        });

        res.render("panel/admin", {
            pagina: "Panel de Gestión",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            estadisticas: {
                totalReservas,
                ReservasPendientes,
                ReservasConfirmadas,
                totalCuentas,
                totalEspacios
            },
            ReservasRecientes
        });
    } catch (error) {
        console.error("Error al cargar panel:", error);
        res.render("panel/admin", {
            pagina: "Panel de Gestión",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al cargar el panel" }]
        });
    }
};

/**
 * Ver todas las Reservas del sistema
 */
const visualizarReservas = async (req, res) => {
    try {
        const { estado, fecha } = req.query;
        let condicionesBusqueda = {};

        if (estado) {
            condicionesBusqueda.estado = estado;
        }

        if (fecha) {
            condicionesBusqueda.fecha_reserva = fecha;
        }

        const todasLasReservas = await ReservaRestaurante.findAll({
            where: condicionesBusqueda,
            order: [["fecha_reserva", "DESC"], ["hora_inicio", "DESC"]],
            include: [
                { model: CuentaUsuario, as: "Usuario", attributes: ["nombre", "email", "telefono"] },
                { model: EspacioComedor, as: "Mesa", attributes: ["nombre", "zona", "capacidad"] }
            ]
        });

        res.render("panel/reservas", {
            pagina: "Gestión de Reservas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            Reservas: todasLasReservas,
            filtros: { estado, fecha }
        });
    } catch (error) {
        console.error("Error al visualizar Reservas:", error);
        res.render("panel/reservas", {
            pagina: "Gestión de Reservas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al cargar las Reservas" }],
            Reservas: []
        });
    }
};

/**
 * Modifica el estado de una Reserva
 */
const modificarEstadoReserva = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const ReservaEncontrada = await ReservaRestaurante.findByPk(id);

        if (!ReservaEncontrada) {
            req.flash('error', 'Reserva no encontrada');
            return res.redirect("/gestion/reservas");
        }

        await ReservaEncontrada.update({ estado });
        req.flash('exito', `Estado de la Reserva actualizado a: ${estado}`);
        res.redirect("/gestion/reservas");
    } catch (error) {
        console.error("Error al modificar estado:", error);
        req.flash('error', 'Error al modificar el estado de la Reserva');
        res.redirect("/gestion/reservas");
    }
};

/**
 * Cambia la fecha y/o hora de la Reserva
 */

const reprogramarReserva = async (req, res) => {
    const { id } = req.params;

    // alidar errores de express-validator 
    let resultadoValidacion = validationResult(req);

    // Si hay errores de validación
    if (!resultadoValidacion.isEmpty()) {
        const reserva = await ReservaRestaurante.findByPk(id);
        if (!reserva) return res.redirect("/gestion/reservas");

        return res.render("panel/reprogramar", {
            pagina: "Reprogramar Reserva",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: resultadoValidacion.array(),
            reserva: { ...reserva.dataValues, fecha_reserva: req.body.fecha_reserva, hora_inicio: req.body.hora_inicio }
        });
    }

    const { fecha_reserva, hora_inicio } = req.body;

    try {
        const ReservaEncontrada = await ReservaRestaurante.findByPk(id);

        if (!ReservaEncontrada) {
            req.flash('error', 'Reserva no encontrada');
            return res.redirect("/gestion/reservas");
        }

        // Validar Horario de Atenci
        const horarioValido = await validarHorarioAtencion(fecha_reserva, hora_inicio);

        if (!horarioValido) {
            return res.render("panel/reprogramar", {
                pagina: "Reprogramar Reserva",
                csrfToken: req.csrfToken(),
                usuario: req.usuario,
                errores: [{ msg: "La hora seleccionada está fuera del horario de atención del restaurante para ese día." }],
                reserva: { ...ReservaEncontrada.dataValues, fecha_reserva, hora_inicio }
            });
        }

        await ReservaEncontrada.update({ fecha_reserva, hora_inicio });
        req.flash('exito', 'Reserva reprogramada exitosamente');
        res.redirect("/gestion/reservas");
    } catch (error) {
        console.error("Error al reprogramar Reserva:", error);
        req.flash('error', 'Error al reprogramar la Reserva');
        res.redirect("/gestion/reservas");
    }
};

/**
 * Elimina una Reserva del sistema
 */
const eliminarReserva = async (req, res) => {
    const { id } = req.params;

    try {
        const ReservaEncontrada = await ReservaRestaurante.findByPk(id);

        if (!ReservaEncontrada) {
            req.flash('error', 'Reserva no encontrada');
            return res.redirect("/gestion/reservas");
        }

        await ReservaEncontrada.destroy();
        req.flash('exito', 'Reserva eliminada exitosamente');
        res.redirect("/gestion/reservas");
    } catch (error) {
        console.error("Error al eliminar Reserva:", error);
        req.flash('error', 'Error al eliminar la Reserva');
        res.redirect("/gestion/reservas");
    }
};

/**
 * Visualiza todas las cuentas de usuario del sistema
 */
const visualizarCuentas = async (req, res) => {
    try {
        const todasLasCuentas = await CuentaUsuario.findAll({
            attributes: { exclude: ["password", "token"] },
            order: [["createdAt", "DESC"]]
        });

        res.render("panel/usuarios", {
            pagina: "Gestión de Cuentas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            cuentas: todasLasCuentas
        });
    } catch (error) {
        console.error("Error al visualizar cuentas:", error);
        res.render("panel/usuarios", {
            pagina: "Gestión de Cuentas",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al cargar las cuentas" }],
            cuentas: []
        });
    }
};

/**
 * Modifica el rol de una cuenta de usuario
 */
const modificarRolCuenta = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    try {
        const cuentaEncontrada = await CuentaUsuario.findByPk(id);

        if (!cuentaEncontrada) {
            req.flash('error', 'Cuenta no encontrada');
            return res.redirect("/gestion/cuentas");
        }

        await cuentaEncontrada.update({ rol });
        req.flash('exito', `Rol actualizado a: ${rol}`);
        res.redirect("/gestion/cuentas");
    } catch (error) {
        console.error("Error al modificar rol:", error);
        req.flash('error', 'Error al modificar el rol');
        res.redirect("/gestion/cuentas");
    }
};

/**
 * Muestra el formulario para reprogramar una reserva
 */
const presentarFormularioReprogramacion = async (req, res) => {
    const { id } = req.params;

    try {
        const reserva = await ReservaRestaurante.findByPk(id);

        if (!reserva) {
            req.flash('error', 'Reserva no encontrada');
            return res.redirect("/gestion/reservas");
        }

        res.render("panel/reprogramar", {
            pagina: "Reprogramar Reserva",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            reserva
        });
    } catch (error) {
        console.error("Error al mostrar formulario de reprogramación:", error);
        req.flash('error', 'Error al cargar el formulario');
        res.redirect("/gestion/reservas");
    }
};

// Exportar funciones del controlador
export {
    mostrarPanelPrincipal,
    visualizarReservas,
    modificarEstadoReserva,
    presentarFormularioReprogramacion,
    reprogramarReserva,
    eliminarReserva,
    visualizarCuentas,
    modificarRolCuenta
};