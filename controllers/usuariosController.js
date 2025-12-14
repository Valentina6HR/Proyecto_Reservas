import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { crearIdentificadorUnico, crearTokenAutenticacion } from "../helpers/tokens.js";
import CuentaUsuario from "../models/Usuarios.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

/**
 * Muestra el formulario de inicio de sesión
 */
const mostrarPaginaIngreso = (req, res) => {
  res.render("auth/login", {
    tituloPagina: "Inicio de Sesión",
    csrfToken: req.csrfToken(),
    usuario: req.usuario
  });
};

/**
 * Procesa las credenciales de inicio de sesión
 */
const procesarCredenciales = async (req, res) => {
  // Validar campo de correo electrónico
  await check("email")
    .isEmail()
    .withMessage("El correo es obligatorio")
    .run(req);

  // Validar campo de contraseña
  await check("password")
    .notEmpty()
    .withMessage("La contraseña no puede estar vacía")
    .run(req);

  // Obtener resultados de validación
  let resultadoValidacion = validationResult(req);

  // Verificar si hay errores de validación
  if (!resultadoValidacion.isEmpty()) {
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesión",
      errores: resultadoValidacion.array(),
      csrfToken: req.csrfToken(),
      usuario: req.usuario
    });
  }

  // Extraer credenciales del formulario
  const { email, password } = req.body;

  // Buscar usuario por correo electrónico
  const cuentaEncontrada = await CuentaUsuario.findOne({
    where: { email },
  });

  // Verificar si el usuario existe
  if (!cuentaEncontrada) {
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no existe" }],
      usuario: req.usuario
    });
  }

  // Verificar la contraseña usando el método del modelo
  if (!cuentaEncontrada.validarCredencial(password)) {
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Contraseña incorrecta" }],
      usuario: req.usuario
    });
  }

  // Generar token de autenticación JWT
  const tokenAutenticacion = crearTokenAutenticacion({
    id: cuentaEncontrada.id,
    nombre: cuentaEncontrada.nombre
  });

  // Guardar el token en la base de datos
  await cuentaEncontrada.update({ token: tokenAutenticacion });

  // Determinar la URL de redirección según el rol del usuario
  const urlRedireccion = (cuentaEncontrada.rol === "admin" || cuentaEncontrada.rol === "recepcionista")
    ? "/gestion/panel"
    : "/";

  // Establecer cookie con el token y redirigir
  return res
    .cookie("_token", tokenAutenticacion, {
      httpOnly: true,
    })
    .redirect(urlRedireccion);
};

/**
 * Muestra el formulario de recuperación de contraseña
 */
const mostrarRecuperacionAcceso = (req, res) => {
  res.render("auth/olvide-password", {
    tituloPagina: "Recuperar Contraseña",
    csrfToken: req.csrfToken(),
  });
};

/**
 * Procesa la solicitud de recuperación de contraseña
 */
const iniciarRecuperacionClave = async (req, res) => {
  // Validar correo electrónico
  await check("email")
    .isEmail()
    .withMessage("Esto no parece un correo válido")
    .run(req);

  let resultadoValidacion = validationResult(req);

  // Verificar errores de validación
  if (!resultadoValidacion.isEmpty()) {
    return res.render("auth/olvide-password", {
      tituloPagina: "Recuperar Contraseña",
      errores: resultadoValidacion.array(),
      csrfToken: req.csrfToken(),
    });
  }

  // Buscar usuario por email
  const { email } = req.body;
  const cuentaEncontrada = await CuentaUsuario.findOne({ where: { email } });

  if (!cuentaEncontrada) {
    return res.render("auth/olvide-password", {
      tituloPagina: "Recuperar Contraseña",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no está registrado" }],
    });
  }

  // Generar token único para recuperación
  cuentaEncontrada.token = crearIdentificadorUnico();
  await cuentaEncontrada.save();

  // Enviar correo de recuperación
  emailOlvidePassword({
    nombre: cuentaEncontrada.nombre,
    email: cuentaEncontrada.email,
    token: cuentaEncontrada.token,
  });

  // Mostrar mensaje de confirmación
  res.render("templates/mensaje", {
    pagina: "Correo Enviado",
    tituloPagina: "Revisa tu correo",
    mensaje: "Hemos enviado un enlace a tu correo electrónico para restablecer tu contraseña.",
    error: false,
  });
};

/**
 * Muestra el formulario de registro de nueva cuenta
 */
const mostrarFormularioNuevaCuenta = (req, res) => {
  res.render("auth/registro", {
    tituloPagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
    usuario: req.usuario
  });
};

/**
 * Procesa el registro de una nueva cuenta de usuario
 */
const crearNuevaCuenta = async (req, res) => {
  // Validar nombre
  await check("name")
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .run(req);

  // Validar email
  await check("email")
    .isEmail()
    .withMessage("El correo electrónico no es válido")
    .run(req);

  // Validar contraseña
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .run(req);

  // Validar confirmación de contraseña
  await check("password_confirmation")
    .equals(req.body.password)
    .withMessage("Las contraseñas no coinciden")
    .run(req);

  let resultadoValidacion = validationResult(req);

  // Verificar errores de validación
  if (!resultadoValidacion.isEmpty()) {
    return res.render("auth/registro", {
      tituloPagina: "Crear Cuenta",
      errores: resultadoValidacion.array(),
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }

  // Extraer datos del formulario
  const { name, email, password } = req.body;

  // Verificar que el usuario no exista
  const cuentaExistente = await CuentaUsuario.findOne({
    where: { email },
  });

  if (cuentaExistente) {
    return res.render("auth/registro", {
      tituloPagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El correo electrónico ya está registrado" }],
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }

  // Crear nueva cuenta de usuario
  try {
    const nuevaCuenta = await CuentaUsuario.create({
      nombre: name,
      email,
      password,
      rol: "cliente", // Rol por defecto
    });

    // Autenticar automáticamente después del registro
    const tokenAutenticacion = crearTokenAutenticacion({
      id: nuevaCuenta.id,
      nombre: nuevaCuenta.nombre
    });

    // Guardar token en la base de datos
    await nuevaCuenta.update({ token: tokenAutenticacion });

    // Establecer cookie y redirigir
    return res
      .cookie("_token", tokenAutenticacion, {
        httpOnly: true,
      })
      .redirect("/");
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.render("auth/registro", {
      tituloPagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Error al crear el usuario. Intenta nuevamente" }],
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }
};

/**
 * Valida el token de recuperación de contraseña
 */
const validarTokenRecuperacion = async (req, res) => {
  const { token } = req.params;

  // Validar que existe el token
  if (!token) {
    return res.render("templates/mensaje", {
      pagina: "Error",
      tituloPagina: "Enlace Inválido",
      mensaje: "El enlace de recuperación no es válido.",
      error: true,
    });
  }

  // Buscar usuario con ese token
  const cuentaEncontrada = await CuentaUsuario.findOne({ where: { token } });

  if (!cuentaEncontrada) {
    return res.render("templates/mensaje", {
      pagina: "Error",
      tituloPagina: "Token Inválido",
      mensaje: "El enlace de recuperación ha expirado o no es válido. Por favor, soliReserva uno nuevo.",
      error: true,
    });
  }

  // Mostrar formulario para nueva contraseña
  res.render("auth/reset-password", {
    pagina: "Nueva Contraseña",
    tituloPagina: "Escribe tu nueva contraseña",
    csrfToken: req.csrfToken(),
  });
};

/**
 * Establece una nueva contraseña para el usuario
 */
const establecerNuevaCredencial = async (req, res) => {
  // Validar contraseña
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .run(req);

  // Validar confirmación
  await check("repeat_password")
    .equals(req.body.password)
    .withMessage("Las contraseñas no coinciden")
    .run(req);

  let resultadoValidacion = validationResult(req);

  // Verificar errores
  if (!resultadoValidacion.isEmpty()) {
    return res.render("auth/reset-password", {
      pagina: "Nueva Contraseña",
      tituloPagina: "Restablece Contraseña",
      csrfToken: req.csrfToken(),
      errores: resultadoValidacion.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Buscar usuario con el token
  const cuentaEncontrada = await CuentaUsuario.findOne({ where: { token } });

  // Validar que el usuario existe
  if (!cuentaEncontrada) {
    return res.render("templates/mensaje", {
      pagina: "Error",
      tituloPagina: "Token Inválido",
      mensaje: "El enlace de recuperación ha expirado o no es válido.",
      error: true,
    });
  }

  // Actualizar contraseña y limpiar token
  cuentaEncontrada.password = password;
  cuentaEncontrada.token = null;
  await cuentaEncontrada.save();

  // Mostrar mensaje de éxito
  res.render("templates/mensaje", {
    pagina: "Éxito",
    tituloPagina: "Contraseña Actualizada",
    mensaje: "Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión.",
    error: false,
  });
};

/**
 * Cierra la sesión del usuario actual
 */
const finalizarSesionActiva = async (req, res) => {
  // Limpiar token de la base de datos si hay usuario autenticado
  if (req.usuario && req.usuario.id) {
    await CuentaUsuario.update({ token: null }, { where: { id: req.usuario.id } });
  }

  // Limpiar cookie y redirigir
  return res.clearCookie("_token").redirect("/");
};

// Exportar todas las funciones del controlador
export {
  mostrarPaginaIngreso,
  procesarCredenciales,
  mostrarFormularioNuevaCuenta,
  crearNuevaCuenta,
  finalizarSesionActiva,
  mostrarRecuperacionAcceso,
  iniciarRecuperacionClave,
  validarTokenRecuperacion,
  establecerNuevaCredencial,
};
