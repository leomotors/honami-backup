import postgres from "postgres";

export function createSQL() {
  return postgres(process.env.DATABASE_URL as string);
}
