export function getDateStr() {
  return new Date().toISOString().slice(0, 10);
}
