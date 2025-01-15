export function createExcludeFlagsForTarball(excludes: string[]) {
  return excludes.map((e) => `--exclude="${e}"`).join(" ");
}

export function createExcludeFlagsForRClone(excludes: string[]) {
  return excludes.map((e) => `--exclude="/${e}**"`).join(" ");
}
