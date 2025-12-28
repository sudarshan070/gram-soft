import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(params: {
    code: ApiErrorCode;
    message: string;
    status: number;
    details?: unknown;
  }) {
    super(params.message);
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function jsonError(err: unknown) {
  const apiErr = normalizeError(err);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: apiErr.code,
        message: apiErr.message,
        details: apiErr.details,
      },
    },
    { status: apiErr.status },
  );
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    return new ApiError({
      code: "INTERNAL_ERROR",
      status: 500,
      message: err.message || "Internal error",
    });
  }
  return new ApiError({
    code: "INTERNAL_ERROR",
    status: 500,
    message: "Internal error",
  });
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError({ code: "BAD_REQUEST", status: 400, message, details });
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError({ code: "UNAUTHORIZED", status: 401, message });
}

export function forbidden(message = "Forbidden") {
  return new ApiError({ code: "FORBIDDEN", status: 403, message });
}

export function notFound(message = "Not found") {
  return new ApiError({ code: "NOT_FOUND", status: 404, message });
}

export function conflict(message = "Conflict") {
  return new ApiError({ code: "CONFLICT", status: 409, message });
}
