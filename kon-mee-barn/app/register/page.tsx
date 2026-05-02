"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/shared/LanguageProvider";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER", "LANDLORD", "TENANT", "AGENT"]),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("BUYER");

  const ROLES = [
    { value: "BUYER", label: t.auth.roleBuyer },
    { value: "TENANT", label: t.auth.roleTenant },
    { value: "SELLER", label: t.auth.roleSeller },
    { value: "LANDLORD", label: t.auth.roleLandlord },
    { value: "AGENT", label: t.auth.roleAgent },
  ];

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "BUYER" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Registration failed");
        return;
      }

      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      toast.success("Account created! Welcome to Kon Mee Barn.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-4">
            <Building2 className="w-6 h-6" />
            Kon Mee Barn
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.createTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.auth.createSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">{t.auth.fullName}</Label>
            <Input id="name" placeholder="John Smith" className="mt-1" {...register("name")} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1" {...register("email")} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input id="password" type="password" placeholder="Min. 6 characters" className="mt-1" {...register("password")} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <Label>{t.auth.iAm}</Label>
            <Select value={role} onValueChange={(v) => { setRole(v); setValue("role", v as any); }}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">{t.auth.phone}</Label>
            <Input id="phone" type="tel" placeholder="08x-xxx-xxxx" className="mt-1" {...register("phone")} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t.auth.createAccount}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.auth.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">{t.auth.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
