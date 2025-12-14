// Importaciones necesarias
import express from "express";
import { mostrarListaEspacios, mostrarFormularioEspacio, crearEspacio, actualizarEspacio, eliminarEspacio } from "../controllers/mesasController.js";
import verificarAccesoAutorizado from "../middleware/protegerRuta.js";
import validarPermisosPorRol from "../middleware/administrarRoles.js";

import { validarDatosEspacio } from "../validations/validacionMesas.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Ruta para visualizar todos los espacios comedor
 * GET /espacios
 * Muestra la lista completa de mesas/espacios
 */
enrutador.get("/espacios", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), mostrarListaEspacios);

/**
 * Rutas para crear nuevo espacio
 * GET: Muestra formulario
 * POST: Procesa creación
 */
enrutador.get("/espacios/crear", verificarAccesoAutorizado, validarPermisosPorRol("admin"), mostrarFormularioEspacio);
enrutador.post("/espacios/crear", verificarAccesoAutorizado, validarPermisosPorRol("admin"), validarDatosEspacio, crearEspacio);

/**
 * Rutas para editar espacio existente
 * GET: Muestra formulario con datos
 * POST: Procesa actualización
 */
enrutador.get("/espacios/:id/editar", verificarAccesoAutorizado, validarPermisosPorRol("admin"), mostrarFormularioEspacio);
enrutador.post("/espacios/:id/editar", verificarAccesoAutorizado, validarPermisosPorRol("admin"), validarDatosEspacio, actualizarEspacio);

/**
 * Ruta para eliminar un espacio
 * POST /espacios/:id/eliminar
 */
enrutador.post("/espacios/:id/eliminar", verificarAccesoAutorizado, validarPermisosPorRol("admin"), eliminarEspacio);

// Exportar el enrutador
export default enrutador;
