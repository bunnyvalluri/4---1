/**
 * Standard debounce utility with cancel support.
 * Used across search inputs, filters, and dynamic queries.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
