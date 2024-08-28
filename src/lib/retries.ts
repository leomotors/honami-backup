export async function withRetries(
  fn: () => unknown,
  retries: number,
  onError: (retry: number, error: unknown) => unknown,
) {
  for (let i = 1; i <= retries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      onError(i, error);
    }
  }
}
