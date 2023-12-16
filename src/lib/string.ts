export function limitSize(str: string, size: number) {
  if (str.length > size) {
    return str.slice(0, size - 3) + "...";
  }

  return str;
}
