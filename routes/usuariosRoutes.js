// Importaciones necesarias
import express from "express";
import {
    mostrarPaginaIngreso,
    procesarCredenciales,
    mostrarFormularioNuevaCuenta,
    mostrarRecuperacionAcceso,
    iniciarRecuperacionClave,
    crearNuevaCuenta,
    validarTokenRecuperacion,
    establecerNuevaCredencial,
    finalizarSesionActiva,
} from "../controllers/usuariosController.js";

// Crear enrutador de Express
const enrutador = express.Router();

/**
 * Rutas de Inicio de Sesión
 * GET: Muestra formulario de login
 * POST: Procesa credenciales de acceso
 */
enrutador.get("/ingresar", mostrarPaginaIngreso);
enrutador.post("/ingresar", procesarCredenciales);

/**
 * Rutas de Registro de Nueva Cuenta
 * GET: Muestra formulario de registro
 * POST: Crea nueva cuenta de usuario
 */
enrutador.get("/nueva-cuenta", mostrarFormularioNuevaCuenta);
enrutador.post("/nueva-cuenta", crearNuevaCuenta);

/**
 * Rutas de Recuperación de Contraseña
 * GET: Muestra formulario para solicitar recuperación
 * POST: Procesa solicitud y envía email con token
 */
enrutador.get("/recuperar-acceso", mostrarRecuperacionAcceso);
enrutador.post("/recuperar-acceso", iniciarRecuperacionClave);

/**
 * Rutas de Restablecimiento de Contraseña
 * GET: Valida token y muestra formulario de nueva contraseña
 * POST: Establece la nueva contraseña
 */
enrutador.get("/recuperar-acceso/:token", validarTokenRecuperacion);
enrutador.post("/recuperar-acceso/:token", establecerNuevaCredencial);

/**
 * Ruta de Cierre de Sesión
 * GET: Finaliza la sesión activa del usuario
 */
enrutador.get("/salir", finalizarSesionActiva);

// Exportar el enrutador
export default enrutador;