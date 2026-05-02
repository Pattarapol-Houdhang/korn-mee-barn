"use client";

import { useEffect, useState } from "react";
import { Loader2, User as UserIcon, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setUser(d);
        setName(d.name ?? "");
        setPhone(d.phone ?? "");
      })
      .catch(() => toast.error(t.dashboard.profileFailed))
      .finally(() => setLoading(false));
  }, [t.dashboard.profileFailed]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        toast.success(t.dashboard.profileUpdated);
      } else {
        toast.error(t.dashboard.profileFailed);
      }
    } catch {
      toast.error(t.dashboard.profileFailed);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.profileTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.dashboard.profileDesc}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{user.role?.toLowerCase()}</span>
              <span className="text-gray-300">·</span>
              <span>Joined {formatDate(user.createdAt)}</span>
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label className="flex items-center gap-1.5 text-sm">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              {t.auth.fullName}
            </Label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} />
          </div>

          <div>
            <Label className="flex items-center gap-1.5 text-sm">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {t.auth.email}
            </Label>
            <Input className="mt-1.5 bg-gray-50 text-gray-500 cursor-not-allowed" value={user.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label className="flex items-center gap-1.5 text-sm">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {t.auth.phone}
            </Label>
            <Input className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+66 ..." maxLength={30} />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? t.dashboard.saving : t.dashboard.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
