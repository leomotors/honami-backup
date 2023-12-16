import { z } from "zod";

const environmentSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CHANNEL_ID: z.string(),

  BACKUP_PATH: z.string(),
});

export const environment = environmentSchema.parse(process.env);
