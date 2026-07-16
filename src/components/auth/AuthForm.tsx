"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name: name || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطایی رخ داد");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h1 className="mb-2 text-2xl font-bold text-emerald-900">
        {mode === "login" ? "ورود به باغ" : "ایجاد حساب کاربری"}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {mode === "login"
          ? "به باغ دیجیتال شخصی خود خوش آمدید"
          : "اولین بذرهای فکری خود را بکارید"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">نام</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
              placeholder="نام شما"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ایمیل</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
            placeholder="you@example.com"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">رمز عبور</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
            dir="ltr"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "لطفاً صبر کنید..." : mode === "login" ? "ورود" : "ثبت‌نام"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            حساب ندارید؟{" "}
            <Link href="/register" className="font-medium text-emerald-700 hover:underline">
              ثبت‌نام
            </Link>
          </>
        ) : (
          <>
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              ورود
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
