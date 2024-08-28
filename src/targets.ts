/**
 * environment.BACKUP_PATH + "/apps",
  environment.BACKUP_PATH + "/selfhost",
  "./pgdump",
 */
import { environment } from "./environment.js";

export type Target = {
  name: string;
  path: string;
  exclude?: string;
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
      exclude:
        "--exclude=gitea-data --exclude=postgres-data --exclude=prometheus-data --exclude=uptime-kuma-data --exclude=jellyfin/cache",
    },
    {
      name: "gitea",
      path: environment.BACKUP_PATH + "/selfhost/gitea-data",
    },
    {
      name: "uptimekuma",
      path: environment.BACKUP_PATH + "/selfhost/uptime-kuma-data",
      exclude: "--exclude=kuma.db-wal",
    },
    {
      name: "pgdump",
      path: "./pgdump",
    },
  ];

  if (snapshotName) {
    targets.push({
      name: "prometheus",
      path: `${environment.BACKUP_PATH}/selfhost/prometheus-data/snapshots/${snapshotName}`,
    });
  }

  return targets;
}
