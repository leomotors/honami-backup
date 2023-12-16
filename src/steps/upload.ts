import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import fs from "node:fs/promises";

import { environment } from "../environment.js";

const sharedKeyCredential = new StorageSharedKeyCredential(
  environment.ACCOUNT_NAME,
  environment.ACCOUNT_KEY,
);

const blobServiceClient = new BlobServiceClient(
  `https://${environment.ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential,
);

export async function uploadBalls() {
  const result = {} as Record<string, { timeUpload: string }>;

  const containerClient = blobServiceClient.getContainerClient(
    environment.CONTAINER_NAME,
  );

  const targets = (await fs.readdir("out")).filter((f) =>
    f.endsWith(".tar.gz"),
  );

  for (const target of targets) {
    const start = performance.now();
    const targetFile = `out/${target}`;
    const fileInfo = await fs.stat(targetFile);

    console.log(
      `Uploading ${target} (File Size: ${(fileInfo.size / 2 ** 20).toFixed(
        4,
      )} MB)...`,
    );

    const blobClient = containerClient.getBlockBlobClient(target);
    const uploadBlobResponse = await blobClient.uploadFile(targetFile);

    const duration = ((performance.now() - start) / 1000).toFixed(3);

    result[target.replace(".tar.gz", "")] = { timeUpload: duration };

    console.log(
      `Uploaded ${target} successfully in ${duration} seconds with request id ${uploadBlobResponse.requestId}`,
    );
  }

  return result;
}
