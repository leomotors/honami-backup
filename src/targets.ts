/**
 * environment.BACKUP_PATH + "/apps",
  environment.BACKUP_PATH + "/selfhost",
  "./pgdump",
 */
import { environment } from "./environment.js";

export type Target = {
  name: string;
  path: string;
};

export function createTargets(snapshotName: string | undefined): Target[] {
  const targets = [
    {
      name: "apps",
      path: environment.BACKUP_PATH + "/apps",
    },
    {
      name: "selfhost",
      path: environment.BACKUP_PATH + "/selfhost",
    },
    {
      name: "pgdump",
      path: "./pgdump",
    },
  ];

  if (snapshotName) {
    targets.push({
      name: snapshotName,
      path: `${environment.BACKUP_PATH}/selfhost/prometheus-data/snapshots/${snapshotName}`,
    });
  }

  return targets;
}
