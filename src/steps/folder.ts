import fs from "node:fs/promises";
import path from "node:path";

/**
 * Recursively calculates the size of a folder.
 * @param folderPath - Path to the folder.
 * @returns Size of the folder in bytes.
 */
export async function getFolderSize(folderPath: string): Promise<number> {
  const files = await fs.readdir(folderPath, { withFileTypes: true });
  const sizes = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(folderPath, file.name);
      if (file.isDirectory()) {
        // Recursively calculate the size for subfolders
        return getFolderSize(filePath);
      } else {
        // Get the size of the file
        const stats = await fs.stat(filePath);
        return stats.size;
      }
    }),
  );

  return sizes.reduce((total, size) => total + size, 0);
}
