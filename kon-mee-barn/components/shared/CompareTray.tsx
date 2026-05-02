"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/components/shared/CompareProvider";
import { useLanguage } from "@/components/shared/LanguageProvider";

export function CompareTray() {
  const { ids, remove, clear, max } = useCompare();
  const { t } = useLanguage();
  const pathname = usePathname();

  if (ids.length === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
          <GitCompareArrows className="w-4 h-4 text-primary" />
          <span className="font-semibold">{t.search.comparing}:</span>
          <span className="text-primary font-bold">{ids.length}/{max}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0">
          {ids.map((id) => (
            <button
              key={id}
              onClick={() => remove(id)}
              className="group flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Remove"
            >
              <span className="truncate max-w-[80px]">{id.slice(-6)}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={clear} className="text-xs text-gray-500 hover:text-red-600 font-medium whitespace-nowrap">
            {t.search.clearCompare}
          </button>
          <Button size="sm" asChild disabled={ids.length < 2}>
            <Link href="/compare">{t.search.viewCompare}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
