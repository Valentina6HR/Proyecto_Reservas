import { ReglasReservacion } from "../models/index.js";

/**
 * Muestra el formulario de configuración de políticas de reservación
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const mostrarConfiguracionPoliticas = async (req, res) => {
    try {
        // Obtener las políticas actuales de la base de datos
        let politicasActuales = await ReglasReservacion.findOne();

        // Si no existen políticas, crear valores por defecto
        if (!politicasActuales) {
            politicasActuales = await ReglasReservacion.create({});
        }

        // Renderizar vista con las políticas actuales
        res.render("config/politicas", {
            pagina: "Políticas de Reservación",
            politicas: politicasActuales,
            csrfToken: req.csrfToken(),
            usuario: req.usuario // Pasar usuario al layout
        });
    } catch (error) {
        console.error("Error al obtener políticas:", error);
        res.status(500).send("Error al cargar las políticas");
    }
};

/**
 * Actualiza las políticas de reservación en la base de datos
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los nuevos valores
 * @param {Object} res - Objeto de respuesta HTTP
 */
const actualizarPoliticas = async (req, res) => {
    try {
        const {
            tiempo_cancelacion,
            tiempo_anticipacion,
            max_personas_reserva,
            duracion_estandar,
            tolerancia_retraso
        } = req.body;

        // Validar que los valores sean números positivos
        if (tiempo_cancelacion < 0 || tiempo_anticipacion < 0 ||
            max_personas_reserva < 1 || duracion_estandar < 1 ||
            tolerancia_retraso < 0) {
            req.flash("error", "Los valores deben ser números positivos válidos");
            return res.redirect("/gestion/politicas");
        }

        // Buscar las políticas existentes
        let politicasActuales = await ReglasReservacion.findOne();

        if (politicasActuales) {
            // Actualizar políticas existentes
            await politicasActuales.update({
                tiempo_cancelacion: parseInt(tiempo_cancelacion),
                tiempo_anticipacion: parseInt(tiempo_anticipacion),
                max_personas_reserva: parseInt(max_personas_reserva),
                duracion_estandar: parseInt(duracion_estandar),
                tolerancia_retraso: parseInt(tolerancia_retraso)
            });
        } else {
            // Crear nuevas políticas
            await ReglasReservacion.create({
                tiempo_cancelacion: parseInt(tiempo_cancelacion),
                tiempo_anticipacion: parseInt(tiempo_anticipacion),
                max_personas_reserva: parseInt(max_personas_reserva),
                duracion_estandar: parseInt(duracion_estandar),
                tolerancia_retraso: parseInt(tolerancia_retraso)
            });
        }

        // Mensaje de éxito
        req.flash("exito", "Políticas actualizadas correctamente");
        res.redirect("/gestion/politicas");
    } catch (error) {
        console.error("Error al actualizar políticas:", error);
        req.flash("error", "Error al actualizar las políticas");
        res.redirect("/gestion/politicas");
    }
};

/**
 * Muestra las políticas de reservación para clientes (vista pública)
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const mostrarPoliticasPublicas = async (req, res) => {
    try {
        // Obtener las políticas actuales
        let politicasActuales = await ReglasReservacion.findOne();

        // Si no existen, usar valores por defecto
        if (!politicasActuales) {
            politicasActuales = await ReglasReservacion.create({});
        }

        // Renderizar vista pública
        res.render("politicas-publicas", {
            pagina: "Políticas de Reservación",
            politicas: politicasActuales,
            usuario: req.usuario // Pasar usuario si existe
        });
    } catch (error) {
        console.error("Error al obtener políticas públicas:", error);
        res.status(500).send("Error al cargar las políticas");
    }
};

export {
    mostrarConfiguracionPoliticas,
    actualizarPoliticas,
    mostrarPoliticasPublicas
};
