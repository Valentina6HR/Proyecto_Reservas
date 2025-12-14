// Importaciones necesarias
import express from "express";
import { mostrarConfiguracionHorarios, actualizarHorarios } from "../controllers/horariosController.js";
import verificarAccesoAutorizado from "../middleware/protegerRuta.js";
import validarPermisosPorRol from "../middleware/administrarRoles.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Ruta para mostrar la configuración de horarios
 * GET /configuracion/horarios
 * Muestra el formulario de configuración de horarios de atención
 */
enrutador.get("/configuracion/horarios", verificarAccesoAutorizado, validarPermisosPorRol("admin"), mostrarConfiguracionHorarios);

/**
 * Ruta para actualizar los horarios de atención
 * POST /configuracion/horarios
 * Procesa y guarda los cambios en los horarios
 */
enrutador.post("/configuracion/horarios", verificarAccesoAutorizado, validarPermisosPorRol("admin"), actualizarHorarios);

// Exportar el enrutador
export default enrutador;
