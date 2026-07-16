import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر"),
  name: z.string().min(1, "نام الزامی است").optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "داده نامعتبر");
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("این ایمیل قبلاً ثبت شده است", 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? null },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return jsonError("خطا در ثبت‌نام", 500);
  }
}
