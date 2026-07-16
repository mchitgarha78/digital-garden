import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return jsonError("احراز هویت لازم است", 401);
}

export function notFound(message = "یافت نشد") {
  return jsonError(message, 404);
}

export function serverError(message = "خطای سرور") {
  return jsonError(message, 500);
}
