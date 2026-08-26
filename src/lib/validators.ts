export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}

export function passwordsMatch(a: string, b: string): boolean {
  return a === b && a.length > 0;
}
