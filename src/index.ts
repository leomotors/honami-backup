import { sendMessage } from "./discord.js";
import { exec } from "./lib/exec.js";
import { limitSize } from "./lib/string.js";
import { archiveBalls } from "./steps/archive.js";
import { dumpPostgres } from "./steps/postgres.js";
import { uploadBalls } from "./steps/upload.js";

async function run() {
  console.log(`\nRUN ${new Date().toLocaleString("th-TH")}`);

  const start = performance.now();

  const pgRes = await dumpPostgres();
  const archiveRes = await archiveBalls();
  const uploadRes = await uploadBalls();

  // Cleanup
  await exec("rm -rf out");

  const keys = Object.keys(archiveRes);
  const summary = keys
    .map(
      (key) =>
        `**${key}**: ${archiveRes[key]?.fileSize} MB, ${archiveRes[key]?.timeArchive} seconds archive, ${uploadRes[key]?.timeUpload} seconds upload`,
    )
    .join("\n");

  const duration = ((performance.now() - start) / 1000).toFixed(3);
  await sendMessage(
    `# ${new Date().toLocaleString(
      "th-TH",
    )} (Total ${duration} seconds)\nPostgresql Dump used ${pgRes} seconds.\n${summary}`,
  );
}

try {
  await run();
} catch (err) {
  await sendMessage(limitSize(`Backup failed :sob::sob::sob:\n${err}`, 2000));
}
