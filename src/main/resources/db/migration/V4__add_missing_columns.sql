-- ============================================================
-- V4__add_missing_columns.sql
-- Agrega columnas que existen en las entidades JPA pero
-- no estaban en el schema original de la BD.
-- Usa ADD COLUMN IF NOT EXISTS (válido en PostgreSQL 9.6+)
-- ============================================================

-- taxi: columna estatus
ALTER TABLE taxi
    ADD COLUMN IF NOT EXISTS estatus VARCHAR(20) NOT NULL DEFAULT 'Activo';

-- usuario: columna estatus
ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS estatus VARCHAR(20) NOT NULL DEFAULT 'Activo';

-- incidencia: columna estado
ALTER TABLE incidencia
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';

-- incidencia: columna no_lista_conductor
ALTER TABLE incidencia
    ADD COLUMN IF NOT EXISTS no_lista_conductor INT;

-- FK de incidencia → usuario (sin IF NOT EXISTS — no soportado en PostgreSQL para constraints)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_incidencia_conductor'
          AND table_name      = 'incidencia'
    ) THEN
        ALTER TABLE incidencia
            ADD CONSTRAINT fk_incidencia_conductor
            FOREIGN KEY (no_lista_conductor) REFERENCES usuario(no_lista);
    END IF;
END $$;
