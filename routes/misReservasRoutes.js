// Importaciones necesarias
import express from "express";
import { visualizarReservasUsuario, cancelarReservaUsuario } from "../controllers/misReservasController.js";
import verificarAccesoAutorizado from "../middleware/protegerRuta.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Ruta para visualizar las reservas del usuario autenticado
 * GET /mis-reservas
 * Muestra todas las reservas (pasadas y futuras) del usuario
 */
enrutador.get("/", verificarAccesoAutorizado, visualizarReservasUsuario);

/**
 * Ruta para cancelar una reserva del usuario
 * POST /mis-reservas/:id/cancelar
 * Permite al usuario cancelar sus propias reservas
 */
enrutador.post("/:id/cancelar", verificarAccesoAutorizado, cancelarReservaUsuario);

// Exportar el enrutador
export default enrutador;
