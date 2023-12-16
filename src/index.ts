import { sendMessage } from "./discord.js";
import { limitSize } from "./lib/string.js";
import { archiveBalls } from "./steps/archive.js";
import { uploadBalls } from "./steps/upload.js";

async function run() {
  const start = performance.now();

  const archiveRes = await archiveBalls();
  const uploadRes = await uploadBalls();

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
    )} (Total ${duration} seconds)\n${summary}`,
  );
}

try {
  await run();
} catch (err) {
  await sendMessage(limitSize(`Backup failed :sob::sob::sob:\n${err}`, 2000));
}
