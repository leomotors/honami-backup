-- Migration 0
CREATE TABLE backup (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    size DOUBLE PRECISION,
    time_zip DOUBLE PRECISION,
    time_upload DOUBLE PRECISION
);

GRANT USAGE ON SEQUENCE backup_id_seq TO localuser;

-- Migration 1

CREATE TYPE backup_destination AS ENUM ('azureblob', 'onedrive');

ALTER TABLE backup
ADD COLUMN destination backup_destination;

UPDATE backup SET destination = 'azureblob';

ALTER TABLE backup
ALTER COLUMN destination SET NOT NULL;
