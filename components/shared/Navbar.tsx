"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Building2, Search, Plus, Menu, X, LogOut, User, LayoutDashboard, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/shared/LanguageProvider";
import { Lang } from "@/lib/translations";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const fetchUnread = () => fetch("/api/messages/unread-count").then((r) => r.json()).then((d) => setUnreadCount(d.count ?? 0)).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const user = session?.user as any;

  const LANGS: { value: Lang; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "th", label: "TH" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Building2 className="w-6 h-6" />
            <span>Kon Mee Barn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Search className="w-4 h-4" />
              {t.nav.browse}
            </Link>
            <Link href="/search?type=SALE" className="text-sm text-gray-600 hover:text-gray-900">{t.nav.buy}</Link>
            <Link href="/search?type=RENT" className="text-sm text-gray-600 hover:text-gray-900">{t.nav.rent}</Link>

            {/* Language switcher */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs">
              {LANGS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLang(value)}
                  className={`px-2.5 py-1 font-medium transition-colors ${lang === value ? "bg-primary text-primary-foreground" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {session ? (
              <div className="flex items-center gap-3">
                <Button size="sm" asChild>
                  <Link href="/listings/new">
                    <Plus className="w-4 h-4 mr-1" />
                    {t.nav.postListing}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {user?.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/listings" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t.nav.myListings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/favorites" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        {t.nav.savedProperties}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/messages" className="cursor-pointer">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t.nav.messages}
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          {t.nav.adminPanel}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.nav.signOut}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t.nav.signIn}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{t.nav.register}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
            <Link href="/search" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.browseProperties}</Link>
            <Link href="/search?type=SALE" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.buy}</Link>
            <Link href="/search?type=RENT" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.rent}</Link>
            {/* Mobile language switcher */}
            <div className="flex items-center gap-2 px-2 py-1">
              {LANGS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLang(value)}
                  className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${lang === value ? "bg-primary text-primary-foreground border-primary" : "text-gray-500 border-gray-300 hover:bg-gray-50"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {session ? (
              <>
                <Link href="/listings/new" className="block px-2 py-2 text-sm text-primary hover:bg-primary/10 rounded">{t.nav.postListing}</Link>
                <Link href="/dashboard/listings" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.myListings}</Link>
                <Link href="/dashboard/favorites" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.savedProperties}</Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">{t.nav.signIn}</Link>
                <Link href="/register" className="block px-2 py-2 text-sm text-primary hover:bg-primary/10 rounded">{t.nav.register}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
