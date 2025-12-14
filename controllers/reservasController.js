// Importaciones necesarias
import { validationResult } from "express-validator";
import { CuentaUsuario, ReservaRestaurante, EspacioComedor, ProgramaAtencion, ReglasReservacion } from "../models/index.js";
import { Op } from "sequelize";
import { validarHorarioAtencion } from "../helpers/validarHorario.js";

/**
 * Obtiene los horarios de atención en formato JSON
 * @returns {string} JSON string con los horarios
 */
const obtenerHorariosFormatoJSON = async () => {
    try {
        const programasActivos = await ProgramaAtencion.findAll({
            where: { activo: true },
            order: [["dia_semana", "ASC"]],
        });
        return JSON.stringify(programasActivos.map(programa => ({
            dia_semana: programa.dia_semana,
            hora_apertura: programa.hora_apertura,
            hora_cierre: programa.hora_cierre,
        })));
    } catch (error) {
        console.error("Error obteniendo horarios:", error);
        return "[]";
    }
};

/**
 * Obtiene las reglas de reservación del sistema
 * @returns {Object} Objeto con las reglas de reservación
 */
const obtenerReglasReservacion = async () => {
    try {
        let reglasActuales = await ReglasReservacion.findOne();
        if (!reglasActuales) {
            reglasActuales = await ReglasReservacion.create({});
        }
        return {
            tiempo_cancelacion_min: reglasActuales.tiempo_cancelacion_min,
            tiempo_anticipacion_horas: reglasActuales.tiempo_anticipacion_horas,
            max_personas_por_reserva: reglasActuales.max_personas_por_reserva,
            duracion_default_min: reglasActuales.duracion_default_min
        };
    } catch (error) {
        console.error("Error obteniendo políticas:", error);
        return {
            tiempo_cancelacion_min: 60,
            tiempo_anticipacion_horas: 1,
            max_personas_por_reserva: 8,
            duracion_default_min: 90
        };
    }
};

/**
 * Muestra el formulario para crear una nueva reserva
 */
const presentarFormularioReserva = async (req, res) => {
    const horariosJSON = await obtenerHorariosFormatoJSON();
    const reglasActuales = await obtenerReglasReservacion();

    res.render("reservas", {
        title: "Reservar Mesa",
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        pagina: "Reservas",
        horarios: horariosJSON,
        politicas: JSON.stringify(reglasActuales)
    });
};

/**
 * Busca un espacio comedor disponible para la Reserva
 * 
 * @param {string} fechaReserva 
 * @param {number} cantidadPersonas
 * @param {string} zonaPreferida - Zona preferida interior, terraza, barra, privado
 * @returns {Object} 
 */
const buscarEspacioDisponible = async (fechaReserva, horaInicio, cantidadPersonas, zonaPreferida) => {
    // Nombres descriptivos para las zonas
    const nombresZonas = {
        interior: "Interior",
        terraza: "Terraza",
        barra: "Barra",
        privado: "Privado"
    };
    const nombreZona = nombresZonas[zonaPreferida] || zonaPreferida;

    // Verificar si existen espacios en el sistema
    const totalEspacios = await EspacioComedor.count();

    if (totalEspacios === 0) {
        return {
            espacio: null,
            error: "Aún no hay espacios disponibles para Reservas, contacte con el restaurante.",
            tipoError: "sin_espacios"
        };
    }

    // Verificar espacios en la zona solicitada
    const espaciosEnZona = await EspacioComedor.count({
        where: {
            estado: "activa",
            zona: zonaPreferida
        }
    });

    if (espaciosEnZona === 0) {
        return {
            espacio: null,
            error: `No hay espacios disponibles en la zona "${nombreZona}". Por favor, selecciona otra zona.`,
            tipoError: "sin_zona"
        };
    }

    // Buscar espacios con capacidad suficiente
    const espaciosConCapacidad = await EspacioComedor.findAll({
        where: {
            estado: "activa",
            zona: zonaPreferida,
            capacidad: {
                [Op.gte]: cantidadPersonas
            }
        },
        order: [
            ["capacidad", "ASC"], // Preferir espacios más ajustados
            ["id", "ASC"]
        ]
    });

    if (espaciosConCapacidad.length === 0) {
        // Buscar capacidad máxima en la zona
        const espacioMaxCapacidad = await EspacioComedor.findOne({
            where: {
                estado: "activa",
                zona: zonaPreferida
            },
            order: [["capacidad", "DESC"]]
        });

        const capacidadMaxima = espacioMaxCapacidad ? espacioMaxCapacidad.capacidad : 0;

        return {
            espacio: null,
            error: `No hay espacios con capacidad para ${cantidadPersonas} personas en la zona "${nombreZona}". La capacidad máxima disponible es de ${capacidadMaxima} personas.`,
            tipoError: "sin_capacidad"
        };
    }

    // Calcular hora de finalización estimada (90 minutos después)
    const [horas, minutos] = horaInicio.split(":").map(Number);
    const momentoInicio = new Date();
    momentoInicio.setHours(horas, minutos, 0, 0);

    const momentoFin = new Date(momentoInicio);
    momentoFin.setMinutes(momentoFin.getMinutes() + 90);

    const horaFinEstimada = `${momentoFin.getHours().toString().padStart(2, "0")}:${momentoFin.getMinutes().toString().padStart(2, "0")}:00`;
    const horaInicioFormateada = `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:00`;

    // Verificar disponibilidad de cada espacio
    for (const espacioComedor of espaciosConCapacidad) {
        // Buscar Reservas existentes para este espacio en la fecha
        const ReservasExistentes = await ReservaRestaurante.findAll({
            where: {
                id_mesa: espacioComedor.id,
                fecha_reserva: fechaReserva,
                estado: {
                    [Op.notIn]: ["cancelada", "no_show"]
                }
            }
        });

        // Si no hay Reservas, el espacio está disponible
        if (ReservasExistentes.length === 0) {
            return { espacio: espacioComedor, error: null, tipoError: null };
        }

        // Verificar solapamiento de horarios
        let hayConflicto = false;

        for (const ReservaExistente of ReservasExistentes) {
            const inicioExistente = ReservaExistente.hora_inicio;
            const finExistente = ReservaExistente.hora_fin;

            // Verificar si hay solapamiento
            if (
                (horaInicioFormateada >= inicioExistente && horaInicioFormateada < finExistente) ||
                (horaFinEstimada > inicioExistente && horaFinEstimada <= finExistente) ||
                (horaInicioFormateada <= inicioExistente && horaFinEstimada >= finExistente)
            ) {
                hayConflicto = true;
                break;
            }
        }

        // Si no hay conflicto, retornar este espacio
        if (!hayConflicto) {
            return { espacio: espacioComedor, error: null, tipoError: null };
        }
    }

    // Todos los espacios están ocupados
    return {
        espacio: null,
        error: `Todos los espacios en la zona "${nombreZona}" están ocupados para el horario seleccionado. Por favor, elige otro horario o zona.`,
        tipoError: "sin_disponibilidad"
    };
};

/**
 * Procesa y registra una nueva Reserva en el sistema
 */
/**
 * Valida si una fecha y hora están dentro del horario de atención
 * 
 * @param {string} fecha - Fecha de la reserva (YYYY-MM-DD)
 * @param {string} hora - Hora de la reserva (HH:MM)
 * @returns {Promise<boolean>} - true si está en horario, false si no
 */
// La función validarHorarioAtencion ha sido movida a helpers/validarHorario.js

/**
 * Procesa y registra una nueva reserva en el sistema
 */
const registrarNuevaReserva = async (req, res) => {
    // Validar resultados del formulario
    let resultadoValidacion = validationResult(req);

    if (!resultadoValidacion.isEmpty()) {
        const horariosJSON = await obtenerHorariosFormatoJSON();
        const reglasActuales = await obtenerReglasReservacion();

        return res.render("reservas", {
            title: "Reservar Mesa",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            pagina: "Reservas",
            errores: resultadoValidacion.array(),
            horarios: horariosJSON,
            politicas: JSON.stringify(reglasActuales),
            datosFormulario: req.body
        });
    }

    // Extraer datos del formulario
    const {
        nombre,
        email,
        telefono,
        fecha_reserva,
        hora_inicio,
        numero_personas,
        zona,
        observaciones,
        dispositivo
    } = req.body;

    // VALIDACIÓN DE HORARIO (Backend)
    const horarioValido = await validarHorarioAtencion(fecha_reserva, hora_inicio);
    if (!horarioValido) {
        const horariosJSON = await obtenerHorariosFormatoJSON();
        const reglasActuales = await obtenerReglasReservacion();

        return res.render("reservas", {
            title: "Reservar Mesa",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            pagina: "Reservas",
            errores: [{ msg: "La hora seleccionada está fuera del horario de atención del restaurante." }],
            horarios: horariosJSON,
            politicas: JSON.stringify(reglasActuales),
            datosFormulario: req.body
        });
    }

    // Buscar espacio disponible
    const { espacio, error, tipoError } = await buscarEspacioDisponible(
        fecha_reserva,
        hora_inicio,
        parseInt(numero_personas),
        zona
    );

    // Si no hay espacio disponible, mostrar error
    if (!espacio) {
        const horariosJSON = await obtenerHorariosFormatoJSON();
        const reglasActuales = await obtenerReglasReservacion();

        return res.render("reservas", {
            title: "Reservar Mesa",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            pagina: "Reservas",
            errores: [{ msg: error }],
            tipoError,
            horarios: horariosJSON,
            politicas: JSON.stringify(reglasActuales),
            datosFormulario: req.body
        });
    }

    // Determinar el canal según el rol del usuario
    let canalReserva = "web";
    if (req.usuario.rol === "admin" || req.usuario.rol === "recepcionista") {
        canalReserva = "presencial"; // Asumimos que el staff crea reservas presenciales
    }

    // Crear la nueva reserva
    try {
        const nuevaReserva = await ReservaRestaurante.create({
            id_usuario: req.usuario.id,
            id_mesa: espacio.id,
            nombre_cliente: nombre,
            email_cliente: email,
            telefono_cliente: telefono,
            fecha_reserva,
            hora_inicio,
            numero_personas: parseInt(numero_personas),
            estado: "pendiente",
            canal: canalReserva,
            observaciones: observaciones || null,
            creado_por: req.usuario.id,
            dispositivo: dispositivo || "desktop"
        });

        // Redirigir con mensaje de éxito (URL actualizada)
        return res.redirect(`/?reserva=${nuevaReserva.id_reserva}&mensaje=exito`);
    } catch (errorCreacion) {
        console.error("Error al crear reserva:", errorCreacion);

        const horariosJSON = await obtenerHorariosFormatoJSON();
        const reglasActuales = await obtenerReglasReservacion();

        return res.render("reservas", {
            title: "Reservar Mesa",
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            pagina: "Reservas",
            errores: [{ msg: "Error al crear la reserva. Por favor, intenta nuevamente." }],
            horarios: horariosJSON,
            politicas: JSON.stringify(reglasActuales),
            datosFormulario: req.body
        });
    }
};

// Exportar funciones del controlador
export {
    presentarFormularioReserva,
    registrarNuevaReserva
};