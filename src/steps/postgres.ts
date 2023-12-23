import { exec } from "../lib/exec.js";

export async function dumpPostgres() {
  const start = performance.now();

  await exec("rm -rf pgdump");
  await exec("mkdir -p pgdump");
  const dateStr = new Date().toISOString().slice(0, 10);

  const { stdout: result } = await exec(
    `sudo docker exec -t postgres psql -P pager=off -U postgres -c "SELECT datname FROM pg_database"`,
  );

  const databases = result
    .split("\n")
    .slice(2, -3)
    .map((dat) => dat.trim())
    .filter((dat) => !["postgres", "template0", "template1"].includes(dat));

  console.log("Databases =", databases);

  for (const dat of databases) {
    const fileName = `${dat}-${dateStr}.sql`;
    await exec(
      `sudo docker exec -t postgres pg_dump -U postgres -d ${dat} -f /var/lib/postgresql/data/${fileName}`,
    );
    await exec(
      `sudo docker cp postgres:/var/lib/postgresql/data/${fileName} ./pgdump/${fileName}`,
    );
  }

  const duration = ((performance.now() - start) / 1000).toFixed(3);
  console.log(`Successfully dumped postgres in ${duration} seconds`);
  return duration;
}
