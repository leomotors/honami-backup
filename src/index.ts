import { sendMessage } from "./discord.js";
import { sql } from "./lib/db.js";
import { limitSize } from "./lib/string.js";
import { archiveBalls } from "./steps/archive.js";
import { dumpPostgres } from "./steps/postgres.js";
import { snapshotPrometheus } from "./steps/prometheus.js";
import { uploadBalls } from "./steps/upload.js";
import { createTargets } from "./targets.js";

async function run() {
  console.log(`\nRUN ${new Date().toLocaleString("th-TH")}`);

  const start = performance.now();

  const pgRes = await dumpPostgres();
  const snapshotName = await snapshotPrometheus();

  const targets = createTargets(snapshotName);

  const archiveRes = await archiveBalls(targets);
  const uploadRes = await uploadBalls(archiveRes);

  const keys = Object.keys(archiveRes);
  const summary = keys
    .map(
      (key) =>
        `**${key}**: ${archiveRes[key]?.fileSize} MB, ${archiveRes[key]?.timeArchive} seconds archive, ${uploadRes[key]?.timeUpload} seconds upload`,
    )
    .join("\n");

  const s = (str: string | undefined) => (str ? +str : null);

  const pgValues = keys.map((key) => ({
    name: key,
    size: s(archiveRes[key]?.fileSize),
    time_zip: s(archiveRes[key]?.timeArchive),
    time_upload: s(uploadRes[key]?.timeUpload),
    destination: "onedrive",
  }));

  try {
    await sql`INSERT INTO backup ${sql(pgValues, "name", "size", "time_zip", "time_upload", "destination")}`;
  } catch (err) {
    console.error("Error saving to database", err);
  }

  const duration = ((performance.now() - start) / 1000).toFixed(3);
  await sendMessage(
    `# ${new Date().toLocaleString(
      "th-TH",
    )} (Total ${duration} seconds)\nPostgresql Dump used ${pgRes} seconds.\n${summary}`,
  );

  await sql.end();
}

try {
  await run();
} catch (err) {
  await sendMessage(limitSize(`Backup failed :sob::sob::sob:\n${err}`, 2000));
}
