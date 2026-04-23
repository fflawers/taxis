-- ============================================================
-- V2__create_ingresos.sql
-- Tabla de ingresos de taxistas
-- Fuente original: migration_create_ingresos.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS ingresos (
  id_ingreso            SERIAL PRIMARY KEY,
  no_lista              INT NOT NULL REFERENCES usuario(no_lista),
  monto                 DECIMAL(12, 2) NOT NULL DEFAULT 0,
  numero_viajes         INT NOT NULL DEFAULT 0,
  fecha                 DATE NOT NULL,
  kilometraje_recorrido DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tarifa_aplicada       DECIMAL(10, 2) NOT NULL DEFAULT 25,
  anio                  INT NOT NULL,
  mes                   INT NOT NULL
);

-- Índices para búsquedas frecuentes por taxista y periodo
CREATE INDEX IF NOT EXISTS idx_ingresos_no_lista  ON ingresos(no_lista);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha     ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_periodo   ON ingresos(no_lista, anio, mes);
