import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): void {
  const response: Record<string, unknown> = { success: false, message };
  if (error !== undefined) response["error"] = error;
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, message, 201);
}

export function sendUnauthorized(res: Response, message = "Unauthorized"): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = "Forbidden"): void {
  sendError(res, message, 403);
}

export function sendNotFound(res: Response, message = "Not found"): void {
  sendError(res, message, 404);
}

export function sendServerError(
  res: Response,
  message = "Internal server error"
): void {
  sendError(res, message, 500);
}
