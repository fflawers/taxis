-- ============================================================
-- V3__increase_varchar_limits.sql
-- Ampliar límites de VARCHAR en incidencia y acuerdo
-- Fuente original: migration_increase_varchar_limits.sql
-- ============================================================

-- Ampliar descripcion en incidencia
ALTER TABLE incidencia
  ALTER COLUMN descripcion TYPE VARCHAR(500);

-- Ampliar observaciones en incidencia a TEXT ilimitado
ALTER TABLE incidencia
  ALTER COLUMN observaciones TYPE TEXT;

-- Ampliar descripcion en acuerdo a TEXT ilimitado (preventivo)
ALTER TABLE acuerdo
  ALTER COLUMN descripcion TYPE TEXT;
