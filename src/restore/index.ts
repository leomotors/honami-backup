import { exec } from "../lib/exec.js";
import { tarExtension } from "../tarball.js";
import { createTargets } from "../targets.js";

import { downloadBalls } from "./download.js";

const totalStart = performance.now();
console.log(`Beginning Restore ${new Date().toLocaleString("th-TH")}`);

const targets = createTargets(undefined);

await downloadBalls();

for (const target of targets) {
  if (target.name === "pgdump") {
    console.warn("pgdump is not implemented yet");
    continue;
  }

  const start = performance.now();
  console.log(`Restoring ${target.name}...`);

  await exec(`mkdir -p ${target.path}`);

  const { stderr } = await exec(
    `tar -xf download/${target.name}.${tarExtension} -C ${target.path}`,
  );

  if (stderr) {
    console.error(`Error when restoring ${target.name}: ${stderr}`);
  }

  const durationMs = performance.now() - start;

  console.log(`Restored ${target.name} in ${durationMs} ms`);
}

const totalEnd = performance.now();
console.log(`Restore Complete in ${totalEnd - totalStart} ms`);
