"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/shared/LanguageProvider";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { t } = useLanguage();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success(t.auth.welcome);
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-4">
            <Building2 className="w-6 h-6" />
            Kon Mee Barn
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.signInTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.auth.welcome}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1" {...register("email")} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">{t.auth.password}</Label>
            <div className="relative mt-1">
              <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" {...register("password")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t.auth.signIn}
          </Button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-primary/10 rounded-xl">
          <p className="text-xs font-semibold text-primary mb-2">{t.auth.demoAccounts}</p>
          <div className="space-y-1 text-xs text-primary">
            {[
              ["Admin", "admin@konmeebarn.com"],
              ["Seller", "seller1@example.com"],
              ["Buyer", "buyer1@example.com"],
            ].map(([role, email]) => (
              <button
                key={email}
                type="button"
                className="block w-full text-left hover:underline"
                onClick={() => {
                  (document.getElementById("email") as HTMLInputElement).value = email;
                  (document.getElementById("password") as HTMLInputElement).value = "password123";
                  toast.info(`Filled in ${role} credentials`);
                }}
              >
                {role}: {email} / password123
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">{t.auth.register}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
