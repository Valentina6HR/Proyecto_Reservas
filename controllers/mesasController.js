import { EspacioComedor } from "../models/index.js";
import { validationResult } from "express-validator";

/**
 * Muestra la lista de todos los espacios comedor
 */
const mostrarListaEspacios = async (req, res) => {
    try {
        const todosLosEspacios = await EspacioComedor.findAll({
            order: [["zona", "ASC"], ["nombre", "ASC"]]
        });

        res.render("mesas/index", {
            pagina: "Gestión de Espacios",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            espacios: todosLosEspacios
        });
    } catch (error) {
        console.error("Error al cargar espacios:", error);
        res.render("mesas/index", {
            pagina: "Gestión de Espacios",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: [{ msg: "Error al cargar los espacios" }],
            espacios: []
        });
    }
};

/**
 * Muestra el formulario para crear o editar un espacio
 */
const mostrarFormularioEspacio = async (req, res) => {
    const { id } = req.params;
    let espacioExistente = null;

    if (id) {
        try {
            espacioExistente = await EspacioComedor.findByPk(id);
        } catch (error) {
            console.error("Error al cargar espacio:", error);
        }
    }

    res.render("mesas/form", {
        pagina: id ? "Editar Espacio" : "Nuevo Espacio",
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        espacio: espacioExistente
    });
};

/**
 * Crea un nuevo espacio comedor en el sistema
 */

const crearEspacio = async (req, res) => {
    // Validar resultados
    let resultadoValidacion = validationResult(req);

    if (!resultadoValidacion.isEmpty()) {
        return res.render("mesas/form", {
            pagina: "Nuevo Espacio",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: resultadoValidacion.array(),
            espacio: {
                nombre: req.body.nombre,
                capacidad: req.body.capacidad,
                zona: req.body.zona,
                estado: req.body.estado
            }
        });
    }

    const { nombre, capacidad, zona, estado } = req.body;

    try {
        await EspacioComedor.create({
            nombre,
            capacidad: parseInt(capacidad),
            zona,
            estado: estado || "activa"
        });

        req.flash('exito', 'Espacio creado exitosamente');
        res.redirect("/espacios");
    } catch (error) {
        console.error("Error al crear espacio:", error);
        req.flash('error', 'Error al crear el espacio');
        res.redirect("/espacios/crear");
    }
};

/**
 * Actualiza un espacio comedor existente
 */
const actualizarEspacio = async (req, res) => {
    const { id } = req.params;

    // Validar resultados
    let resultadoValidacion = validationResult(req);

    if (!resultadoValidacion.isEmpty()) {
        return res.render("mesas/form", {
            pagina: "Editar Espacio",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            errores: resultadoValidacion.array(),
            espacio: {
                nombre: req.body.nombre,
                capacidad: req.body.capacidad,
                zona: req.body.zona,
                estado: req.body.estado
            }
        });
    }

    const { nombre, capacidad, zona, estado } = req.body;

    try {
        const espacioEncontrado = await EspacioComedor.findByPk(id);

        if (!espacioEncontrado) {
            req.flash('error', 'Espacio no encontrado');
            return res.redirect("/espacios");
        }

        await espacioEncontrado.update({
            nombre,
            capacidad: parseInt(capacidad),
            zona,
            estado
        });

        req.flash('exito', 'Espacio actualizado exitosamente');
        res.redirect("/espacios");
    } catch (error) {
        console.error("Error al actualizar espacio:", error);
        req.flash('error', 'Error al actualizar el espacio');
        res.redirect(`/espacios/${id}/editar`);
    }
};

/**
 * Elimina un espacio comedor del sistema
 */
const eliminarEspacio = async (req, res) => {
    const { id } = req.params;

    try {
        const espacioEncontrado = await EspacioComedor.findByPk(id);

        if (!espacioEncontrado) {
            req.flash('error', 'Espacio no encontrado');
            return res.redirect("/espacios");
        }

        await espacioEncontrado.destroy();
        req.flash('exito', 'Espacio eliminado exitosamente');
        res.redirect("/espacios");
    } catch (error) {
        console.error("Error al eliminar espacio:", error);
        req.flash('error', 'Error al eliminar el espacio');
        res.redirect("/espacios");
    }
};

// Exportar funciones del controlador
export {
    mostrarListaEspacios,
    mostrarFormularioEspacio,
    crearEspacio,
    actualizarEspacio,
    eliminarEspacio
};