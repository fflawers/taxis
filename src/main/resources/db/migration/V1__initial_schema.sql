-- ============================================================
-- V1__initial_schema.sql
-- Esquema inicial de la base de datos taxis
-- Fuente original: basetaxis1.session.sql
-- ============================================================

-- TABLA: incidencia
CREATE TABLE IF NOT EXISTS incidencia (
  id_incidencia SERIAL PRIMARY KEY,
  descripcion   VARCHAR(45),
  observaciones VARCHAR(45),
  estado        VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  no_lista_conductor INT
);

-- TABLA: acuerdo
CREATE TABLE IF NOT EXISTS acuerdo (
  id_acuerdo    SERIAL PRIMARY KEY,
  descripcion   TEXT,
  id_incidencia INT REFERENCES incidencia(id_incidencia)
);

-- TABLA: usuario
CREATE TABLE IF NOT EXISTS usuario (
  no_lista           SERIAL PRIMARY KEY,
  rol                VARCHAR(45),
  contrasena         VARCHAR(255),
  nombre             VARCHAR(255),
  apellido_p         VARCHAR(255),
  apellido_m         VARCHAR(255),
  edad               VARCHAR(255),
  fecha_de_nacimiento VARCHAR(255),
  estatus            VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- Agregar FK de incidencia → usuario después de crear usuario
ALTER TABLE incidencia
  ADD CONSTRAINT fk_incidencia_conductor
  FOREIGN KEY (no_lista_conductor) REFERENCES usuario(no_lista);

-- TABLA: taxi
CREATE TABLE IF NOT EXISTS taxi (
  economico SERIAL PRIMARY KEY,
  marca     VARCHAR(45),
  modelo    VARCHAR(45),
  anio      INT,
  placa     VARCHAR(255),
  no_lista  INT REFERENCES usuario(no_lista),
  estatus   VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- TABLA: reporte
CREATE TABLE IF NOT EXISTS reporte (
  id_reporte    SERIAL PRIMARY KEY,
  no_lista      INT REFERENCES usuario(no_lista),
  economico     INT REFERENCES taxi(economico),
  fecha_reporte DATE,
  observaciones VARCHAR(45),
  id_incidencia INT REFERENCES incidencia(id_incidencia),
  id_acuerdo    INT REFERENCES acuerdo(id_acuerdo)
);
