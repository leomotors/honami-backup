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

-- Migration 2
CREATE TABLE backup_setup (
    id        SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name      TEXT NOT NULL,
    time_s    DOUBLE PRECISION
);

GRANT USAGE ON SEQUENCE backup_setup_id_seq TO localuser;

-- Migration 2.1
ALTER TABLE backup
    ALTER COLUMN compression DROP NOT NULL;

CREATE TYPE upload_type AS ENUM ('folder', 'tarball', 'tarball_gzip', 'tarball_bzip2', 'tarball_xz');

ALTER TABLE backup
    ADD COLUMN upload_type upload_type;
