import { Request } from "express";

/**
 * Safely extract a string route param from req.params.
 * Express params are typed as `string | string[]` in strict mode,
 * but in practice they are always strings.
 */
export function param(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
