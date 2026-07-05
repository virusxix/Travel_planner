/** Express 5 params can be string | string[] — normalize once */
export function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
