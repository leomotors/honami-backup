import { ConfigPostgresEnabled } from "../config.js";
import { getDateStr } from "../lib/date.js";
import { exec } from "../lib/exec.js";

async function cleanupPostgres(config: ConfigPostgresEnabled) {
  const { stdout } = await exec(
    `docker exec -t ${config.postgres.containerName} ls -1 /var/lib/postgresql/data`,
  );
  const sqlFiles = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((f) => f.endsWith(".sql"));

  console.log(
    `[Postgres] Cleaning up previous dump - ${sqlFiles.length} files`,
  );

  for (const file of sqlFiles) {
    await exec(
      `docker exec -t ${config.postgres.containerName} rm /var/lib/postgresql/data/${file}`,
    );
  }
}

export async function dumpPostgres(config: ConfigPostgresEnabled) {
  const start = performance.now();

  await exec("rm -rf pgdump");
  await exec("mkdir -p pgdump");
  const dateStr = getDateStr();

  const { stdout: result } = await exec(
    `docker exec -t ${config.postgres.containerName} psql -P pager=off -U ${config.postgres.rootUsername} -d postgres -c "SELECT datname FROM pg_database"`,
  );

  const databases = result
    .split("\n")
    .slice(2, -3)
    .map((dat) => dat.trim())
    .filter((dat) => !["postgres", "template0", "template1"].includes(dat));

  console.log("Databases =", databases);

  // Cleanup Previous Run
  await cleanupPostgres(config);

  for (const dat of databases) {
    const fileName = `${dat}-${dateStr}.sql`;
    await exec(
      `docker exec -t ${config.postgres.containerName} pg_dump -U ${config.postgres.rootUsername} -d ${dat} -f /var/lib/postgresql/data/${fileName}`,
    );
    await exec(
      `docker cp ${config.postgres.containerName}:/var/lib/postgresql/data/${fileName} ./pgdump/${fileName}`,
    );
  }

  const duration = (performance.now() - start) / 1000;
  console.log(`Successfully dumped postgres in ${duration} seconds`);
  return duration;
}
