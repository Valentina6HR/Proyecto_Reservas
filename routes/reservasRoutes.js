// Importaciones necesarias
import express from "express";
import { presentarFormularioReserva, registrarNuevaReserva } from "../controllers/reservasController.js";
import verificarAccesoAutorizado from "../middleware/protegerRuta.js";
import { validarDatosCita } from "../validations/validacionReservas.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Ruta para mostrar el formulario de reservas
 * GET /reservas
 * Requiere autenticación
 */
enrutador.get("/", verificarAccesoAutorizado, presentarFormularioReserva);

/**
 * Ruta para procesar el formulario de reservas
 * POST /reservas
 * Requiere autenticación y validación de datos
 */
enrutador.post("/", verificarAccesoAutorizado, validarDatosCita, registrarNuevaReserva);

// Exportar el enrutador
export default enrutador;
