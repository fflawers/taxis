-- Migration: Increase VARCHAR limits for incidencia table
-- Date: 2026-02-13
-- Reason: Users need more space for descriptions and observations

-- Update incidencia table
ALTER TABLE incidencia 
ALTER COLUMN descripcion TYPE VARCHAR(500);

ALTER TABLE incidencia 
ALTER COLUMN observaciones TYPE TEXT;

-- Update acuerdo table (preventive)
ALTER TABLE acuerdo 
ALTER COLUMN descripcion TYPE TEXT;

-- Confirm changes
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'incidencia' 
   OR table_name = 'acuerdo'
ORDER BY table_name, ordinal_position;
