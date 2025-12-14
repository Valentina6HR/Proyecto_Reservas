// Importaciones de módulos principales
import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import db from "./config/db.js";

// Importación de enrutadores
import enrutadorAcceso from "./routes/usuariosRoutes.js";
import enrutadorCitas from "./routes/reservasRoutes.js";
import enrutadorGestion from "./routes/adminRoutes.js";
import enrutadorEspacios from "./routes/mesasRoutes.js";
import enrutadorHorarios from "./routes/horariosRoutes.js";
import enrutadorMisReservas from "./routes/misReservasRoutes.js";
import enrutadorPoliticas from "./routes/politicasRoutes.js";

// Importación de middleware
import { reconocerSesionActiva } from "./middleware/identificarUsuario.js";

/**
 * Variable para rastrear el estado de conexión a la base de datos
 * Se actualiza después de intentar la conexión
 */
let estadoConexionBaseDatos = false;

/**
 * Crear instancia de la aplicación Express
 * Esta es la aplicación web principal del sistema
 */
const aplicacionWeb = express();

/**
 * Configuración de Middlewares
 * Se configuran en orden específico para el correcto funcionamiento
 */

// Habilitar lectura de datos de formularios (URL-encoded)
aplicacionWeb.use(express.urlencoded({ extended: true }));

// Habilitar el analizador de cookies
aplicacionWeb.use(cookieParser());

// Configurar sesiones de usuario
aplicacionWeb.use(session({
  secret: process.env.SECRET_KEY || 'clave_secreta_super_segura',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Duración: 24 horas
  }
}));

// Habilitar mensajes flash para notificaciones
aplicacionWeb.use(flash());

// Middleware para pasar mensajes flash a todas las vistas
aplicacionWeb.use((req, res, next) => {
  res.locals.mensajes = {
    error: req.flash('error'),
    exito: req.flash('exito')
  };
  next();
});

// Habilitar protección CSRF (Cross-Site Request Forgery)
aplicacionWeb.use(csurf({ cookie: true }));

/**
 * Conexión a la Base de Datos
 * Intenta conectar y sincronizar con la base de datos MySQL
 */
try {
  await db.authenticate();
  await db.sync({ alter: true }); // Sincronizar modelos con la BD
  console.log("✓ Conexión exitosa a la base de datos");
  estadoConexionBaseDatos = true;
} catch (errorConexion) {
  console.error("✗ Error al conectar con la base de datos:", errorConexion);
  estadoConexionBaseDatos = false;
}

/**
 * Configuración del Motor de Plantillas
 * Utiliza Pug para renderizar las vistas
 */
aplicacionWeb.set("view engine", "pug");
aplicacionWeb.set("views", "./views");

/**
 * Definir carpeta de archivos estáticos
 * Sirve CSS, JavaScript, imágenes, etc.
 */
aplicacionWeb.use(express.static("public"));

/**
 * Middleware para identificar usuario en todas las rutas
 * Permite que las vistas sepan si hay un usuario autenticado
 */
aplicacionWeb.use(reconocerSesionActiva);

/**
 * Configuración de Rutas de la Aplicación
 * Cada grupo de rutas maneja una funcionalidad específica
 */

// Rutas de autenticación y gestión de cuentas
aplicacionWeb.use("/acceso", enrutadorAcceso);

// Rutas de gestión de reservas (anteriormente citas)
aplicacionWeb.use("/reservas", enrutadorCitas);

// Ruta para gestionar las reservas del usuario autenticado
aplicacionWeb.use("/mis-reservas", enrutadorMisReservas);

// Ruta pública para ver políticas de reservación (sin autenticación)
aplicacionWeb.use("/politicas", enrutadorPoliticas);

// Rutas del panel de gestión (admin y recepcionista)
aplicacionWeb.use("/", enrutadorGestion);

// Rutas de gestión de espacios comedor (mesas)
aplicacionWeb.use("/", enrutadorEspacios);

// Rutas de configuración de horarios
aplicacionWeb.use("/", enrutadorHorarios);

/**
 * Ruta Principal - Página de Inicio
 * Muestra la página principal del restaurante
 */
aplicacionWeb.get("/", (req, res) => {
  // Obtener mensajes de éxito desde parámetros de consulta
  const { reserva, mensaje } = req.query;

  let mensajeExito = null;

  // Si viene de una reserva exitosa, preparar mensaje
  if (reserva && mensaje === 'exito') {
    mensajeExito = {
      tipo: 'exito',
      texto: `¡Tu reserva #${reserva} ha sido creada exitosamente! Te contactaremos pronto para confirmar.`
    };
  }

  // Renderizar vista principal
  res.render("index", {
    title: "Inicio",
    dbStatus: estadoConexionBaseDatos,
    pagina: "Inicio",
    usuario: req.usuario,
    mensajeExito
  });
});

/**
 * Configuración del Servidor
 * Define el puerto y arranca el servidor
 */
const puertoServidor = process.env.PORT || 3000;

aplicacionWeb.listen(puertoServidor, '0.0.0.0', () => {
  console.log(`✓ El servidor está corriendo en el puerto: ${puertoServidor}`);

  // Mostrar direcciones IP locales para acceso desde otros dispositivos
  import('os').then(os => {
    const interfacesRed = os.networkInterfaces();
    const direccionesIP = [];

    // Recorrer todas las interfaces de red
    Object.keys(interfacesRed).forEach((nombreInterfaz) => {
      interfacesRed[nombreInterfaz].forEach((interfaz) => {
        // Filtrar solo direcciones IPv4 no internas
        if (interfaz.family === 'IPv4' && !interfaz.internal) {
          direccionesIP.push(interfaz.address);
        }
      });
    });

    // Mostrar direcciones disponibles
    if (direccionesIP.length > 0) {
      console.log('\\nPara acceder desde otros dispositivos en la misma red:');
      direccionesIP.forEach(ip => {
        console.log(`  → http://${ip}:${puertoServidor}`);
      });
      console.log('\\nAsegúrate de que los dispositivos estén en la misma red WiFi.\\n');
    }
  });
});
