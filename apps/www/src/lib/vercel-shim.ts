export function waitUntil<T>(promise: Promise<T>): void {
  promise.catch((error) => {
    console.error("[vercel-shim] unhandled promise in waitUntil:", error);
  });
}
