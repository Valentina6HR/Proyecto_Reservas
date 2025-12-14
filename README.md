# Sistema de Gestión de Citas para Restaurante

Sistema web moderno y elegante para la gestión de reservaciones en restaurantes, desarrollado con Node.js, Express, Pug y Tailwind CSS. Presenta un diseño femenino y delicado con tonos morados y pasteles.

## 🎨 Características del Diseño

- **Tema Visual**: Diseño femenino y elegante con paleta de colores morados y pasteles
- **Colores Principales**: 
  - Morado: `#a78bfa`, `#c4b5fd`, `#e9d5ff`, `#d8b4fe`
  - Rosa suave: `#f5d0fe`, `#fbcfe8`
  - Fondos claros: `#faf7ff`, blanco con acentos violetas
- **Estilo**: Bordes redondeados, sombras suaves, transiciones fluidas
- **Tipografía**: Fuentes ligeras y elegantes (font-light, font-medium)
- **Componentes**: Botones con gradientes morado-rosa, tarjetas con sombras sutiles

## ✨ Funcionalidades Principales

### Para Clientes
- Registro e inicio de sesión seguro
- Creación de citas (reservaciones) con selección de:
  - Fecha y hora
  - Número de personas
  - Zona preferida (interior, terraza, barra, privado)
  - Observaciones especiales
- Visualización y gestión de citas personales
- Cancelación de citas con restricciones de tiempo
- Notificaciones por correo electrónico

### Para Administradores y Recepcionistas
- Panel de gestión completo
- Visualización de todas las citas
- Cambio de estado de citas (pendiente, confirmada, en curso, completada, cancelada, no show)
- Reagendación de citas
- Gestión de usuarios y roles
- Gestión de espacios comedor (mesas)
- Configuración de horarios de atención
- Configuración de políticas de reservación
- Generación de reportes e informes

## 🏗️ Arquitectura del Sistema

### Backend

#### Modelos de Datos
- **CuentaUsuario**: Gestión de usuarios con diferentes roles (admin, recepcionista, mesero, cliente)
- **CitaRestaurante**: Reservaciones con información completa del cliente y mesa asignada
- **EspacioComedor**: Mesas/espacios disponibles con capacidad y zona
- **ProgramaAtencion**: Horarios de operación por día de la semana
- **ReglasReservacion**: Políticas y restricciones de reservas
- **ParametrosEstablecimiento**: Configuración general del restaurante

#### Controladores
- **Gestión de Cuentas**: Autenticación, registro, recuperación de contraseña
- **Gestión de Citas**: Creación, modificación, cancelación de reservas
- **Panel Administrativo**: Gestión completa de citas y usuarios
- **Gestión de Espacios**: CRUD de mesas y zonas
- **Configuración**: Horarios y políticas

#### Middleware
- **verificarAccesoAutorizado**: Protección de rutas que requieren autenticación
- **reconocerSesionActiva**: Identificación de usuario en rutas públicas
- **validarPermisosPorRol**: Control de acceso basado en roles

### Frontend

#### Vistas Principales
- Página de inicio con presentación del restaurante
- Formulario de citas con validación en tiempo real
- Panel de usuario para gestionar citas personales
- Panel administrativo con estadísticas y gestión completa

#### Componentes Reutilizables
- Mixins de Pug para formularios y mensajes de error
- Layouts responsivos para usuario y administrador
- Componentes de notificación y alertas

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- MySQL/MariaDB
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Proyecto_Reservas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:
   ```env
   # Base de datos
   DB_NAME=nombre_base_datos
   DB_USER=usuario_db
   DB_PASS=contraseña_db
   DB_HOST=localhost
   DB_PORT=3306

   # JWT
   JWT_SECRETA=tu_clave_secreta_muy_segura

   # Sesiones
   SECRET_KEY=tu_clave_de_sesion_muy_segura

   # Email (opcional, para notificaciones)
   EMAIL_HOST=smtp.ejemplo.com
   EMAIL_PORT=587
   EMAIL_USER=tu_email@ejemplo.com
   EMAIL_PASS=tu_contraseña_email

   # Servidor
   PORT=3000
   BACKEND_URL=http://localhost
   ```

4. **Inicializar la base de datos**
   ```bash
   # Importar datos iniciales (horarios, usuarios de prueba)
   npm run db:importar
   ```

5. **Compilar estilos de Tailwind CSS**
   ```bash
   # En una terminal separada
   npm run styles
   ```

6. **Iniciar el servidor**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev

   # Producción
   npm start
   ```

7. **Acceder a la aplicación**
   
   Abrir el navegador en: `http://localhost:3000`

## 📱 Uso del Sistema

### Acceso Inicial

**Usuario Administrador** (creado por el seeder):
- Email: `admin@restaurante.com`
- Contraseña: `admin123`

**Usuario Cliente** (ejemplo):
- Registrarse desde la página de registro
- Confirmar cuenta (si está configurado el email)

### Flujo de Reservación

1. **Cliente**:
   - Iniciar sesión o registrarse
   - Navegar a "Hacer Reserva"
   - Completar formulario con:
     - Datos personales
     - Fecha y hora deseada
     - Número de personas
     - Zona preferida
     - Observaciones (opcional)
   - Enviar reserva
   - Recibir confirmación

2. **Recepcionista/Admin**:
   - Ver reserva en panel administrativo
   - Confirmar o modificar según disponibilidad
   - Asignar mesa específica si es necesario
   - Actualizar estado durante el servicio

### Gestión de Mesas

1. Acceder al panel administrativo
2. Ir a "Gestión de Espacios"
3. Crear/editar mesas con:
   - Nombre identificador
   - Capacidad de personas
   - Zona (interior, terraza, barra, privado)
   - Estado (activa/inactiva)

### Configuración de Horarios

1. Acceder a "Configuración de Horarios"
2. Definir para cada día de la semana:
   - Hora de apertura
   - Hora de cierre
   - Estado activo/inactivo

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **Sequelize**: ORM para base de datos
- **MySQL**: Base de datos relacional
- **bcrypt**: Encriptación de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **express-validator**: Validación de datos
- **nodemailer**: Envío de correos electrónicos
- **connect-flash**: Mensajes flash
- **cookie-parser**: Manejo de cookies
- **csurf**: Protección CSRF

### Frontend
- **Pug**: Motor de plantillas
- **Tailwind CSS**: Framework de estilos
- **JavaScript**: Interactividad del cliente
- **AOS**: Animaciones al hacer scroll

### Desarrollo
- **nodemon**: Reinicio automático del servidor
- **concurrently**: Ejecución de múltiples scripts
- **webpack**: Empaquetado de JavaScript

## 📂 Estructura del Proyecto

```
Proyecto_Reservas/
├── config/
│   └── db.js                    # Configuración de base de datos
├── controllers/
│   ├── usuariosController.js    # Lógica de autenticación y usuarios
│   ├── reservasController.js    # Lógica de reservas
│   ├── adminController.js       # Lógica del panel admin
│   ├── mesasController.js       # Gestión de mesas
│   ├── horariosController.js    # Gestión de horarios
│   ├── misReservasController.js # Reservas del usuario
│   └── reportesController.js    # Generación de reportes
├── helpers/
│   ├── tokens.js                # Generación de tokens JWT
│   └── emails.js                # Envío de correos
├── middleware/
│   ├── protegerRuta.js          # Protección de rutas
│   ├── identificarUsuario.js    # Identificación de sesión
│   └── administrarRoles.js      # Control de acceso por roles
├── models/
│   ├── Usuarios.js              # Modelo de usuarios
│   ├── Reservas.js              # Modelo de reservas
│   ├── Mesas.js                 # Modelo de mesas
│   ├── HorarioAtencion.js       # Modelo de horarios
│   ├── PoliticaReserva.js       # Modelo de políticas
│   ├── ConfiguracionRestaurante.js # Modelo de configuración
│   └── index.js                 # Exportación y relaciones
├── routes/
│   ├── usuariosRoutes.js        # Rutas de autenticación
│   ├── reservasRoutes.js        # Rutas de reservas
│   ├── adminRoutes.js           # Rutas administrativas
│   ├── mesasRoutes.js           # Rutas de mesas
│   ├── horariosRoutes.js        # Rutas de horarios
│   └── misReservasRoutes.js     # Rutas de usuario
├── validations/
│   └── validacionReservas.js    # Validaciones de formularios
├── views/
│   ├── layout/                  # Plantillas base
│   ├── auth/                    # Vistas de autenticación
│   ├── panel/                   # Vistas del panel admin
│   ├── mesas/                   # Vistas de gestión de mesas
│   ├── config/                  # Vistas de configuración
│   ├── usuario/                 # Vistas del usuario
│   ├── mixins/                  # Componentes reutilizables
│   ├── templates/               # Plantillas de mensajes
│   ├── index.pug                # Página principal
│   └── reservas.pug             # Formulario de reservas
├── public/
│   ├── css/                     # Estilos compilados
│   ├── js/                      # JavaScript del cliente
│   └── img/                     # Imágenes
├── seed/
│   ├── seeder.js                # Script de importación de datos
│   ├── usuario.js               # Datos de usuarios iniciales
│   └── horarioAtencion.js       # Datos de horarios iniciales
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── index.js                     # Punto de entrada de la aplicación
├── package.json                 # Dependencias y scripts
└── README.md                    # Este archivo
```

## 🔒 Seguridad

- **Autenticación**: JWT con tokens almacenados en cookies httpOnly
- **Contraseñas**: Encriptadas con bcrypt (10 rounds de salt)
- **Protección CSRF**: Tokens CSRF en todos los formularios
- **Validación**: Validación de datos en cliente y servidor
- **Sesiones**: Sesiones seguras con express-session
- **Control de acceso**: Middleware de roles para rutas protegidas

## 📊 Base de Datos

### Tablas Principales

- **usuarios**: Cuentas de usuario con roles y autenticación
- **reservas**: Citas con información completa
- **mesas**: Espacios comedor disponibles
- **horarios_atencion**: Programación semanal
- **politicas_reserva**: Reglas y restricciones
- **configuracion_restaurante**: Parámetros del establecimiento

### Relaciones

- Un usuario puede tener múltiples reservas
- Una reserva pertenece a un usuario (cliente)
- Una reserva puede estar asignada a una mesa
- Una mesa puede tener múltiples reservas en diferentes horarios
- Una reserva fue creada por un usuario (puede ser recepcionista)

## 🎯 Próximas Mejoras

- [ ] Integración con pasarelas de pago para depósitos
- [ ] Sistema de notificaciones push
- [ ] Aplicación móvil nativa
- [ ] Integración con sistemas POS
- [ ] Dashboard con gráficos y métricas avanzadas
- [ ] Sistema de fidelización de clientes
- [ ] Reservas recurrentes
- [ ] Lista de espera automática
- [ ] Integración con redes sociales
- [ ] API REST pública para integraciones

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con nodemon
npm run styles           # Compila Tailwind CSS en modo watch

# Producción
npm start                # Inicia servidor en producción

# Base de datos
npm run db:importar      # Importa datos iniciales
npm run db:eliminar      # Elimina todos los datos

# Compilación
npm run css              # Compila Tailwind CSS una vez
npm run js               # Empaqueta JavaScript con webpack
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autores

- Desarrollado con ❤️ para ofrecer una experiencia de reservación elegante y eficiente

## 📞 Soporte

Para soporte o consultas, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Nota**: Este sistema ha sido completamente refactorizado con nuevos nombres de variables, funciones y rutas, manteniendo la funcionalidad original pero con una estructura de código completamente diferente y un diseño visual renovado con tema morado/pastel femenino.
