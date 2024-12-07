import { z } from "zod";

import {
  Config,
  isPostgresEnabled,
  isPrometheusEnabled,
  targetSchema,
} from "./config.js";

export function createTargets(
  config: Config,
  snapshotName: string | undefined,
): z.infer<typeof targetSchema>[] {
  const targets = config.targets;

  if (isPostgresEnabled(config)) {
    targets.push({
      name: "pgdump",
      path: "./pgdump",
      exclude: [],
      uploadType: config.postgres.uploadType,
      checksum: true,
    });
  }

  if (isPrometheusEnabled(config) && snapshotName) {
    targets.push({
      name: "prometheus",
      path: `${config.prometheus.folderPath}/snapshots/${snapshotName}`,
      exclude: [],
      uploadType: config.prometheus.uploadType,
      checksum: true,
    });
  }

  return targets;
}
