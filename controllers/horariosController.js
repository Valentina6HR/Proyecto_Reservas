import { ProgramaAtencion } from "../models/index.js";

/**
 * Muestra la configuración de horarios de atención
 */
const mostrarConfiguracionHorarios = async (req, res) => {
  try {
    const horariosActuales = await ProgramaAtencion.findAll({
      order: [["dia_semana", "ASC"]]
    });

    res.render("config/config", {
      pagina: "Configuración de Horarios",
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      horarios: horariosActuales
    });
  } catch (error) {
    console.error("Error al cargar horarios:", error);
    res.render("config/config", {
      pagina: "Configuración de Horarios",
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      errores: [{ msg: "Error al cargar los horarios" }],
      horarios: []
    });
  }
};

/**
 * Actualiza los horarios de atención del restaurante
 */
const actualizarHorarios = async (req, res) => {
  try {
    const { horarios } = req.body;

    // Procesar cada horario recibido
    for (const horarioData of horarios) {
      const { id, hora_apertura, hora_cierre, activo } = horarioData;

      const horarioEncontrado = await ProgramaAtencion.findByPk(id);

      if (horarioEncontrado) {
        await horarioEncontrado.update({
          hora_apertura,
          hora_cierre,
          activo: activo === 'true' || activo === true
        });
      }
    }

    req.flash('exito', 'Horarios actualizados exitosamente');
    res.redirect("/configuracion/horarios");
  } catch (error) {
    console.error("Error al actualizar horarios:", error);
    req.flash('error', 'Error al actualizar los horarios');
    res.redirect("/configuracion/horarios");
  }
};

// Exportar funciones del controlador
export {
  mostrarConfiguracionHorarios,
  actualizarHorarios
};