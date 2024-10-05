import {
  isPostgresEnabled,
  isPrometheusEnabled,
  readConfig,
} from "./config.js";
import { sendMessage } from "./discord.js";
import { createSQL } from "./lib/db.js";
import { limitSize } from "./lib/string.js";
import { archiveBalls } from "./steps/archive.js";
import { dumpPostgres } from "./steps/postgres.js";
import { snapshotPrometheus } from "./steps/prometheus.js";
import { uploadBalls } from "./steps/upload.js";
import { createTargets } from "./targets.js";

async function run() {
  console.log(`\n\nRUN ${new Date().toLocaleString("th-TH")}`);

  const start = performance.now();

  // Step 0: Read config and dump for postgres and prometheus
  const config = await readConfig();

  const pgRes = isPostgresEnabled(config)
    ? await dumpPostgres(config)
    : "(DISABLED)";
  const snapshotName = isPrometheusEnabled(config)
    ? await snapshotPrometheus(config)
    : undefined;

  const targets = createTargets(config, snapshotName);

  const setupTime = performance.now();

  // Step 1: Archive
  const archiveRes = await archiveBalls(targets);
  const archiveTime = performance.now();

  // Step 2: Upload
  const uploadRes = await uploadBalls(archiveRes);
  const uploadTime = performance.now();

  const d1000 = (num: number | undefined) => (num ? num / 1000 : null);

  const keys = Object.keys(archiveRes);
  const summary = keys
    .map(
      (key) =>
        `**${key}**: ${archiveRes[key]!.fileSize.toFixed(4)} MB, ${archiveRes[key]!.timeArchive.toFixed(3)} seconds archive, ${d1000(uploadRes[key]?.timeUpload)?.toFixed(3)} seconds upload`,
    )
    .join("\n");

  const pgValues = keys.map((key) => ({
    name: key,
    size: archiveRes[key]!.fileSize,
    time_zip: archiveRes[key]!.timeArchive,
    time_upload: d1000(uploadRes[key]?.timeUpload),
    destination: "onedrive",
    compression: archiveRes[key]!.gzip ? "gzip" : "none",
  }));

  const sql = createSQL();

  try {
    await sql`INSERT INTO backup ${sql(pgValues, "name", "size", "time_zip", "time_upload", "destination", "compression")}`;
  } catch (err) {
    console.error("Error saving to database", err);
  } finally {
    await sql.end();
  }

  const sqlTime = performance.now();

  const getDuration = (start: number, end: number) =>
    ((end - start) / 1000).toFixed(3);

  const setupDuration = getDuration(start, setupTime);
  const archiveDuration = getDuration(setupTime, archiveTime);
  const uploadDuration = getDuration(archiveTime, uploadTime);
  const sqlDuration = getDuration(uploadTime, sqlTime);
  const totalDuration = getDuration(start, sqlTime);

  const reportMessage = `# Backup Report: ${new Date().toLocaleString("th-TH")}
## Total Time: ${totalDuration} seconds
- Setup: ${setupDuration} seconds (Postgres Dump: ${pgRes} seconds, Prometheus Snapshot Name: ${snapshotName ?? "(DISABLED)"})
- Archive: ${archiveDuration} seconds
- Upload: ${uploadDuration} seconds
- SQL: ${sqlDuration} seconds
## Targets
${summary}`;

  await sendMessage(reportMessage);
}

try {
  await run();
} catch (err) {
  await sendMessage(limitSize(`Backup failed :sob::sob::sob:\n${err}`, 2000));
}
