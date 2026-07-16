import { AuthForm } from "@/components/auth/AuthForm";
import { Sprout } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="mb-8 flex items-center gap-3 text-emerald-800">
        <Sprout className="h-10 w-10" />
        <div>
          <h2 className="text-xl font-bold">باغ دیجیتال</h2>
          <p className="text-sm text-emerald-600">شروع سفر مدیریت دانش</p>
        </div>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
