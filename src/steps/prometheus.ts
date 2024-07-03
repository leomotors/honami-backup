import { environment } from "../environment.js";
import { getDateStr } from "../lib/date.js";
import { exec } from "../lib/exec.js";

/**
 * Example: {"status":"success","data":{"name":"20240403T035352Z-264a0b9cf9242532"}}
 */
type SnapshotSuccess = {
  status: "success";
  data: {
    name: string;
  };
};

export function isSuccess(obj: object): obj is SnapshotSuccess {
  return (
    "status" in obj &&
    obj.status === "success" &&
    "data" in obj &&
    "name" in (obj.data as object)
  );
}

export async function snapshotPrometheus() {
  try {
    // Cleanup Previous Snapshots
    await exec(
      `rm -rf ${environment.BACKUP_PATH}/selfhost/prometheus-data/snapshots`,
    );

    const result = await fetch(
      `${environment.PROMETHEUS_URL}/api/v1/admin/tsdb/snapshot`,
      {
        method: "POST",
        headers: {
          Authorization: environment.PROMETHEUS_TOKEN,
        },
        body: JSON.stringify({ name: getDateStr() }),
      },
    ).then((r) => r.json());

    if (isSuccess(result)) {
      console.log(
        `Prometheus API Snapshot Generate Success: ${result.data.name}`,
      );
      return result.data.name;
    } else {
      console.error(
        `Prometheus API Invalid Response: ${JSON.stringify(result, null, 4)}`,
      );
    }
  } catch (err) {
    console.error(`Prometheus API Error: ${err}`);
  }
}
