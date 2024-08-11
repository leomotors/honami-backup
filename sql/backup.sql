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

-- Migration 1.1
CREATE TYPE compression AS ENUM ('none', 'gzip', 'bzip2');

ALTER TABLE backup
ADD COLUMN compression compression;

UPDATE backup SET compression = 'gzip';

ALTER TABLE backup
ALTER COLUMN compression SET NOT NULL;
