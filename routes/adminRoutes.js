// Importaciones necesarias
import express from "express";
import { mostrarPanelPrincipal, visualizarReservas, modificarEstadoReserva, eliminarReserva, reprogramarReserva, presentarFormularioReprogramacion, visualizarCuentas, modificarRolCuenta } from "../controllers/adminController.js";
import { generarResumenInformes } from "../controllers/reportesController.js";
import {
    mostrarConfiguracionPoliticas,
    actualizarPoliticas
} from "../controllers/politicasController.js";
import verificarAccesoAutorizado from "../middleware/protegerRuta.js";
import validarPermisosPorRol from "../middleware/administrarRoles.js";
import { validarDatosReprogramacion } from "../validations/validacionReprogramacion.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Ruta del Panel Principal de Gestión
 * Accesible para administradores y recepcionistas
 * GET /gestion/panel
 */
enrutador.get("/gestion/panel", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), mostrarPanelPrincipal);

/**
 * Rutas de Gestión de Reservas
 * Permiten ver y modificar todas las reservas del sistema
 */

// Ver todas las reservas
enrutador.get("/gestion/reservas", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), visualizarReservas);

// Cambiar estado de una reserva
enrutador.post("/gestion/reservas/:id/estado", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), modificarEstadoReserva);

// Reprogramar una reserva
enrutador.get("/gestion/reservas/:id/reprogramar", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), presentarFormularioReprogramacion);
enrutador.post("/gestion/reservas/:id/reprogramar", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), validarDatosReprogramacion, reprogramarReserva);

// Eliminar una reserva
enrutador.post("/gestion/reservas/:id/eliminar", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), eliminarReserva);

/**
 * Rutas de Gestión de Cuentas de Usuario
 * Solo accesibles para administradores
 */

// Ver todas las cuentas
enrutador.get("/gestion/cuentas", verificarAccesoAutorizado, validarPermisosPorRol("admin"), visualizarCuentas);

// Cambiar rol de una cuenta
enrutador.post("/gestion/cuentas/:id/rol", verificarAccesoAutorizado, validarPermisosPorRol("admin"), modificarRolCuenta);

/**
 * Ruta de Informes y Reportes
 * Genera estadísticas y resúmenes del sistema
 * GET /gestion/informes
 */
enrutador.get("/gestion/informes", verificarAccesoAutorizado, validarPermisosPorRol("admin", "recepcionista"), generarResumenInformes);

// ========================================
// Rutas de Políticas de Reservación
// ========================================
// Ruta para mostrar formulario de políticas (solo admin)
enrutador.get("/gestion/politicas", verificarAccesoAutorizado, validarPermisosPorRol("admin"), mostrarConfiguracionPoliticas);

// Ruta para actualizar políticas (solo admin)
enrutador.post("/gestion/politicas", verificarAccesoAutorizado, validarPermisosPorRol("admin"), actualizarPoliticas);

// Exportar el enrutador
export default enrutador;