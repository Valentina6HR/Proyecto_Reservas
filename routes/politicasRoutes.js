import express from "express";
import { mostrarPoliticasPublicas } from "../controllers/politicasController.js";

// Crear enrutador para políticas públicas
const enrutadorPoliticas = express.Router();

/**
 * Ruta pública para mostrar las políticas de reservación
 * No requiere autenticación - accesible para todos
 */
enrutadorPoliticas.get("/", mostrarPoliticasPublicas);

export default enrutadorPoliticas;
