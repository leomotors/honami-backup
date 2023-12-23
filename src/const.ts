import { environment } from "./environment.js";

export const targets = [
  environment.BACKUP_PATH + "/apps",
  environment.BACKUP_PATH + "/selfhost",
  "./pgdump",
];
