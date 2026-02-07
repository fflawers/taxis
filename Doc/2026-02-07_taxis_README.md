# 🚖 Sistema de Gestión de Taxis - README

> **Nombre del Proyecto:** SITIO-TAXIS  
> **Versión:** 1.0.0  
> **Última Actualización:** 2026-02-07

---

## 📋 Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Audiencia Destino](#audiencia-destino)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación Local](#instalación-local)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Variables de Entorno](#variables-de-entorno)
8. [Ejecución del Sistema](#ejecución-del-sistema)
9. [Endpoints Principales](#endpoints-principales)
10. [Base de Datos](#base-de-datos)
11. [Guía Rápida por Audiencia](#guía-rápida-por-audiencia)
12. [Troubleshooting](#troubleshooting)
13. [Información Crítica para Desarrolladores](#información-crítica-para-desarrolladores)

---

## 📖 Descripción del Proyecto

**Sistema de Gestión de Taxis** es una aplicación web full-stack diseñada para administrar una flotilla de taxis, conductores, incidencias, acuerdos, reportes e ingresos. El sistema implementa:

- **Autenticación basada en roles** (Administrador/Taxista)
- **Encriptación AES-256-CBC** para datos sensibles (nombres, apellidos, edades, fechas de nacimiento, placas)
- **Hashing de contraseñas** con bcrypt (10 salt rounds)
- **Dashboard analítico** con gráficas interactivas (Chart.js)
- **CRUD completo** para todas las entidades del negocio

### Funcionalidades Principales

| Módulo | Descripción |
|--------|-------------|
| **Usuarios** | Gestión de administradores y taxistas con encriptación de datos personales |
| **Taxis** | Registro de flota vehicular con asignación de conductores |
| **Incidencias** | Registro y seguimiento de problemas reportados |
| **Acuerdos** | Resoluciones vinculadas a incidencias |
| **Reportes** | Documentación que relaciona conductor, taxi, incidencia y acuerdo |
| **Ingresos** | Registro de viajes, kilometraje y cálculo automático de ingresos |
| **Dashboard** | Análisis visual con rankings y resúmenes operativos |

---

## 👥 Audiencia Destino

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso total: usuarios, taxis, incidencias, acuerdos, reportes, dashboard, gestión de activos |
| **Taxista** | Acceso limitado: ver sus reportes, ver sus acuerdos, registrar ingresos |

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18.x+ | Runtime JavaScript |
| **Express.js** | 4.19.2 | Framework web |
| **PostgreSQL** | 15.x+ | Base de datos relacional |
| **pg** | 8.16.3 | Driver PostgreSQL para Node.js |
| **bcrypt** | 6.0.0 | Hashing de contraseñas |
| **crypto** | Built-in | Encriptación AES-256-CBC |
| **cors** | 2.8.5 | Manejo de CORS |
| **dotenv** | 17.2.3 | Variables de entorno |
| **nodemon** | 3.1.10 | Hot-reload (desarrollo) |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.1 | Librería UI |
| **Vite** | 7.1.7 | Build tool y dev server |
| **React Router DOM** | 7.9.3 | Enrutamiento SPA |
| **Bootstrap** | 5.3.8 | Framework CSS |
| **Chart.js** | 4.5.1 | Gráficas interactivas |
| **react-chartjs-2** | 5.3.1 | Wrapper React para Chart.js |
| **react-icons** | 5.5.0 | Iconos |
| **serve** | 14.2.5 | Servidor estático para producción |

### Infraestructura / DevOps

| Tecnología | Propósito |
|------------|-----------|
| **Docker** | Contenerización del backend |
| **AWS App Runner** | Despliegue en la nube (compatible) |
| **Railway/Render** | Alternativas de despliegue |

---

## 📦 Requisitos Previos

### Software Necesario

```bash
# Verificar instalaciones
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
git --version     # >= 2.40.0
```

### Base de Datos

- **PostgreSQL 15+** instalado y corriendo
- Crear una base de datos para el proyecto
- Credenciales de acceso (host, user, password, database)

### Puertos Requeridos

| Servicio | Puerto |
|----------|--------|
| Backend API | 3000 |
| Frontend Dev Server | 5173 |
| PostgreSQL | 5432 |

---

## 🚀 Instalación Local

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd taxis
```

### Paso 2: Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env  # Si existe template
# O crear manualmente (ver sección Variables de Entorno)
```

### Paso 3: Configurar la Base de Datos

Ejecutar el script SQL para crear las tablas:

```sql
-- TABLA: incidencia
CREATE TABLE IF NOT EXISTS incidencia (
  id_incidencia SERIAL PRIMARY KEY,
  descripcion VARCHAR(45),
  observaciones VARCHAR(45),
  estado VARCHAR(20) DEFAULT 'PENDIENTE',
  no_lista_conductor INT REFERENCES usuario(no_lista)
);

-- TABLA: acuerdo
CREATE TABLE IF NOT EXISTS acuerdo (
  id_acuerdo SERIAL PRIMARY KEY,
  descripcion TEXT,
  id_incidencia INT REFERENCES incidencia(id_incidencia)
);

-- TABLA: usuario
CREATE TABLE IF NOT EXISTS usuario (
  no_lista SERIAL PRIMARY KEY,
  rol VARCHAR(45),
  contrasena VARCHAR(255),
  nombre VARCHAR(255),
  apellido_p VARCHAR(255),
  apellido_m VARCHAR(255),
  edad VARCHAR(255),
  fecha_de_nacimiento VARCHAR(255),
  estatus VARCHAR(45) DEFAULT 'Activo'
);

-- TABLA: taxi
CREATE TABLE IF NOT EXISTS taxi (
  economico SERIAL PRIMARY KEY,
  marca VARCHAR(45),
  modelo VARCHAR(45),
  anio INT,
  placa VARCHAR(255),
  no_lista INT REFERENCES usuario(no_lista),
  estatus VARCHAR(45) DEFAULT 'Activo'
);

-- TABLA: reporte
CREATE TABLE IF NOT EXISTS reporte (
  id_reporte SERIAL PRIMARY KEY,
  no_lista INT REFERENCES usuario(no_lista),
  economico INT REFERENCES taxi(economico),
  fecha_reporte DATE,
  observaciones VARCHAR(45),
  id_incidencia INT REFERENCES incidencia(id_incidencia),
  id_acuerdo INT REFERENCES acuerdo(id_acuerdo)
);

-- TABLA: ingresos
CREATE TABLE IF NOT EXISTS ingresos (
  id_ingreso SERIAL PRIMARY KEY,
  no_lista INT REFERENCES usuario(no_lista),
  monto DECIMAL(10,2),
  numero_viajes INT,
  fecha DATE,
  kilometraje_recorrido DECIMAL(10,2),
  tarifa_aplicada DECIMAL(10,2),
  anio INT,
  mes INT
);
```

### Paso 4: Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd ../SITIO-TAXIS

# Instalar dependencias
npm install

# Crear archivo de configuración
# Crear archivo .env con:
# VITE_API_URL=http://localhost:3000
```

### Paso 5: Iniciar los Servicios

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output esperado: Servidor backend corriendo en el puerto 3000
```

**Terminal 2 - Frontend:**
```bash
cd SITIO-TAXIS
npm run dev
# Output esperado: Local: http://localhost:5173/
```

---

## 📁 Estructura del Proyecto

```
taxis/
├── backend/                          # API REST Node.js/Express
│   ├── server.js                     # Servidor principal (1234 líneas)
│   ├── db.js                         # Configuración pool PostgreSQL
│   ├── crypto-utils.js               # Funciones encrypt/decrypt AES-256
│   ├── migrate-data.js               # Script migración MySQL→PostgreSQL
│   ├── Dockerfile                    # Contenerización
│   ├── package.json                  # Dependencias backend
│   └── package-lock.json
│
├── SITIO-TAXIS/                      # Frontend React/Vite
│   ├── public/                       # Assets estáticos
│   ├── src/
│   │   ├── App.jsx                   # Router principal y rutas protegidas
│   │   ├── main.jsx                  # Entry point React
│   │   ├── assets/
│   │   │   └── Global.css            # Estilos globales
│   │   └── components/
│   │       ├── Banner/               # Componente banner
│   │       ├── Dashboard/
│   │       │   └── dashboard.tsx     # Dashboard con Chart.js
│   │       ├── Footers/
│   │       │   └── IndexFooter.jsx   # Footer global
│   │       ├── Formularios/
│   │       │   └── Formulario.jsx    # Formulario de login
│   │       ├── Icons/                # Componentes de iconos
│   │       ├── Index/
│   │       │   └── Index.jsx         # Página de inicio/login
│   │       ├── Nabvars/
│   │       │   ├── Nabvar.jsx        # Navbar administrador
│   │       │   └── TaxistaNavbar.jsx # Navbar taxista
│   │       ├── secure/
│   │       │   ├── AuthContext.jsx   # Context de autenticación
│   │       │   └── ProtectedRoute.jsx# HOC rutas protegidas
│   │       ├── views/                # Vistas de administrador
│   │       │   ├── UsuariosPage.jsx  # CRUD usuarios
│   │       │   ├── TaxisPage.jsx     # CRUD taxis
│   │       │   ├── IncidenciasPage.jsx # CRUD incidencias
│   │       │   ├── AcuerdosPage.jsx  # CRUD acuerdos
│   │       │   ├── ReportesPage.jsx  # CRUD reportes
│   │       │   ├── GestionActivos.jsx# Gestión unificada
│   │       │   ├── Reports.jsx       # Reportes avanzados
│   │       │   └── Usuarios.jsx      # Dashboard usuarios
│   │       └── viewsTaxis/           # Vistas de taxista
│   │           ├── TaxistasPage.jsx  # Home taxista
│   │           ├── MisReportes.jsx   # Ver mis reportes
│   │           ├── MisAcuerdos.jsx   # Ver mis acuerdos
│   │           └── RegistrarIngresos.jsx # Registrar viajes
│   ├── index.html                    # HTML principal
│   ├── vite.config.js                # Configuración Vite
│   ├── eslint.config.js              # Configuración ESLint
│   └── package.json                  # Dependencias frontend
│
├── Doc/                              # Documentación generada
├── basetaxis1.session.sql            # Script SQL inicial
├── package-lock.json                 # Lock file raíz
└── .gitignore
```

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

```env
# Base de Datos PostgreSQL
DB_HOST=your-postgres-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name

# Puerto del servidor (opcional, default: 3000)
PORT=3000
```

### Frontend (`SITIO-TAXIS/.env`)

```env
# URL del API Backend
VITE_API_URL=http://localhost:3000
```

> ⚠️ **IMPORTANTE:** La clave de encriptación está hardcodeada en `crypto-utils.js`. Ver sección de mejoras de seguridad.

---

## ▶️ Ejecución del Sistema

### Desarrollo Local

```bash
# Backend (puerto 3000)
cd backend && npm run dev

# Frontend (puerto 5173)
cd SITIO-TAXIS && npm run dev
```

### Producción

```bash
# Backend
cd backend && node server.js

# Frontend - Build
cd SITIO-TAXIS && npm run build

# Frontend - Serve
cd SITIO-TAXIS && npm run start
```

### Docker (Backend)

```bash
cd backend
docker build -t taxis-backend .
docker run -p 3000:3000 --env-file .env taxis-backend
```

---

## 🌐 Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login` | Inicio de sesión |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios` | Listar todos los usuarios |
| GET | `/usuarios/:id` | Obtener usuario por ID |
| GET | `/usuarios/taxistas` | Listar solo taxistas |
| POST | `/usuarios` | Crear nuevo usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Eliminar usuario |

### Taxis

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/taxis` | Listar todos los taxis |
| POST | `/taxis` | Crear nuevo taxi |
| PUT | `/taxis/:id` | Actualizar taxi |
| DELETE | `/taxis/:id` | Eliminar taxi |

### Incidencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/incidencias` | Listar incidencias (con filtro por estado) |
| POST | `/incidencias` | Crear incidencia |
| PUT | `/incidencias/:id` | Actualizar incidencia |
| DELETE | `/incidencias/:id` | Eliminar incidencia |
| POST | `/incidencias/:id/resolver` | Resolver incidencia |

### Acuerdos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/acuerdos` | Listar acuerdos |
| GET | `/acuerdos/taxista/:id` | Acuerdos de un taxista |
| POST | `/acuerdos` | Crear acuerdo |
| PUT | `/acuerdos/:id` | Actualizar acuerdo |
| DELETE | `/acuerdos/:id` | Eliminar acuerdo |

### Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reportes` | Listar reportes |
| GET | `/reportes/taxista/:id` | Reportes de un taxista |
| POST | `/reportes` | Crear reporte |
| PUT | `/reportes/:id` | Actualizar reporte |
| DELETE | `/reportes/:id` | Eliminar reporte |

### Ingresos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ingresos` | Registrar ingresos |
| GET | `/ingresos/taxista/:id` | Resumen ingresos taxista |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/analisis/:modulo` | Análisis por módulo |
| GET | `/dashboard/viajes-top` | Ranking de viajes |
| GET | `/dashboard/ingresos-mensuales` | Resumen mensual |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/prueba` | Health check de BD |

---

## 🗄️ Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   usuario   │       │    taxi     │       │  incidencia │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ PK no_lista │◄──────│ FK no_lista │       │PK id_incid. │
│    rol      │       │ PK economico│       │ descripcion │
│  contrasena │       │    marca    │       │observaciones│
│   nombre    │       │   modelo    │       │   estado    │
│  apellido_p │       │    anio     │       │FK no_lista_ │
│  apellido_m │       │    placa    │       │  conductor  │
│    edad     │       │   estatus   │       └──────┬──────┘
│fecha_nacim. │       └─────────────┘              │
│   estatus   │                                    │
└──────┬──────┘                                    │
       │                                           │
       │         ┌─────────────┐                   │
       │         │   acuerdo   │                   │
       │         ├─────────────┤                   │
       │         │PK id_acuerdo│◄──────────────────┘
       │         │ descripcion │
       │         │FK id_incid. │
       │         └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────────────────────────┐
│            reporte              │
├─────────────────────────────────┤
│       PK id_reporte             │
│       FK no_lista               │
│       FK economico              │
│       fecha_reporte             │
│       observaciones             │
│       FK id_incidencia          │
│       FK id_acuerdo             │
└─────────────────────────────────┘

┌─────────────┐
│   ingresos  │
├─────────────┤
│PK id_ingreso│
│ FK no_lista │
│    monto    │
│numero_viajes│
│    fecha    │
│ kilometraje │
│   tarifa    │
│ anio / mes  │
└─────────────┘
```

### Tablas y Campos

| Tabla | Campos Encriptados | Notas |
|-------|-------------------|-------|
| `usuario` | nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento | Contraseña hasheada con bcrypt |
| `taxi` | placa | - |
| `incidencia` | - | Estado: PENDIENTE/RESUELTA |
| `acuerdo` | - | Vinculado a incidencia |
| `reporte` | - | Relación central del sistema |
| `ingresos` | - | Cálculo automático de monto |

---

## 📚 Guía Rápida por Audiencia

### Para Desarrolladores

1. Fork y clonar el repositorio
2. Revisar `backend/server.js` para entender los endpoints
3. Revisar `SITIO-TAXIS/src/App.jsx` para entender el routing
4. Variables sensibles en archivos `.env`
5. Encriptación en `crypto-utils.js` - **NO MODIFICAR SIN ENTENDER IMPLICACIONES**

### Para Project Managers

- **Rutas Admin:** `/inicio`, `/usuarios`, `/taxis`, `/incidencias`, `/acuerdo`, `/reports`, `/dashbor`, `/gestion`, `/reporte`
- **Rutas Taxista:** `/taxistas`, `/reportes`, `/resolution`, `/ingresos`
- **Módulos Dashboard:** Rankings de ingresos, reportes, viajes; resumen mensual

### Para DevOps

1. Dockerfile disponible en `backend/`
2. Variables requeridas: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`
3. Frontend build: `npm run build` genera `/dist`
4. Servidor estático: `serve -s dist -l $PORT`
5. Health check: `GET /prueba`

---

## 🔧 Troubleshooting

### Error: "ECONNREFUSED" al conectar a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
cat backend/.env
```

### Error: "Cannot find module 'bcrypt'"

```bash
# Reinstalar dependencias nativas
cd backend
npm rebuild bcrypt
```

### Error: "CORS blocked"

El backend ya tiene CORS habilitado globalmente. Si persiste:

```javascript
// Verificar en server.js
app.use(cors());
```

### Error: "Failed to decrypt"

Los datos existentes pueden no estar encriptados. Ejecutar migración:

```bash
cd backend
node migrate-data.js
```

### Frontend no encuentra la API

```bash
# Verificar variable de entorno
echo $VITE_API_URL
# Debe ser: http://localhost:3000 (desarrollo)
```

### Error de autenticación "401 Unauthorized"

1. Verificar que el usuario exista en la BD
2. Verificar que la contraseña fue hasheada con bcrypt al crear el usuario
3. Limpiar `sessionStorage` en el navegador

---

## ⚠️ Información Crítica para Desarrolladores

### Seguridad

> [!CAUTION]
> **Clave de Encriptación Hardcodeada:** La clave AES-256 está en `crypto-utils.js` línea 8. DEBE moverse a variables de entorno antes de producción.

```javascript
// ACTUAL (INSEGURO)
const ENCRYPTION_KEY = 'p7sA!Zq3#R9bK@vG*cF8xHn2$Jm5wE&T';

// RECOMENDADO
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
```

> [!WARNING]
> **SessionStorage para Autenticación:** Los datos del usuario se guardan en `sessionStorage`. Esto NO es seguro para producción. Implementar JWT con httpOnly cookies.

### Deudas Técnicas Identificadas

| Prioridad | Descripción |
|-----------|-------------|
| 🔴 Alta | Clave de encriptación hardcodeada |
| 🔴 Alta | No hay tokens JWT, solo sessionStorage |
| 🔴 Alta | No hay rate limiting en endpoints |
| 🟠 Media | No hay validación de entrada con express-validator |
| 🟠 Media | Falta middleware de autenticación en backend |
| 🟠 Media | Contraseñas de migración expuestas en migrate-data.js |
| 🟡 Baja | No hay tests automatizados |
| 🟡 Baja | Dependencias de frontend en package.json del backend |
| 🟡 Baja | Falta paginación en listados |

### Patrones de Código

- **Encriptación:** Siempre usar `encrypt()`/`decrypt()` de `crypto-utils.js`
- **Contraseñas:** Siempre usar `bcrypt.hash()` con `saltRounds = 10`
- **Errores BD:** El código de error `23503` indica violación de FK (registro en uso)
- **Frontend State:** Usar `useState([])` como default para arrays evitando `.map()` errors

---

## 📞 Contacto y Soporte

Para reportes de bugs o solicitudes de features, crear un issue en el repositorio.

---

*Documentación generada el 2026-02-07*
