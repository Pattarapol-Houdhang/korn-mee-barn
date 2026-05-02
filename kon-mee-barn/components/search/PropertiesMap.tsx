"use client";

import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/utils";

interface Pin {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: string;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);

  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).L));
      existing.addEventListener("error", reject);
      if ((window as any).L) resolve((window as any).L);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function PropertiesMap({ properties, emptyLabel }: { properties: Pin[]; emptyLabel: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const pins = properties.filter((p) => p.latitude != null && p.longitude != null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: true }).setView([13.7563, 100.5018], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.icon) map.removeLayer(layer);
      });

      if (pins.length === 0) return;

      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="background:#012d08;color:white;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;">📍</div>`,
        iconSize: [28, 24],
        iconAnchor: [14, 12],
      });

      const group: any[] = [];
      pins.forEach((p) => {
        const images = (() => { try { return JSON.parse(p.images) as string[]; } catch { return []; } })();
        const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200";
        const marker = L.marker([p.latitude!, p.longitude!], { icon: markerIcon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:180px;font-family:inherit">
            <a href="/properties/${p.id}" style="text-decoration:none;color:inherit">
              <img src="${thumb}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:6px" />
              <div style="font-weight:600;font-size:13px;line-height:1.3;color:#111;margin-bottom:2px">${p.title.replace(/</g, "&lt;")}</div>
              <div style="font-size:12px;color:#012d08;font-weight:700">${formatPrice(p.price, p.transactionType)}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">${p.city}</div>
            </a>
          </div>
        `);
        group.push(marker);
      });

      const bounds = L.featureGroup(group).getBounds();
      map.fitBounds(bounds.pad(0.2), { maxZoom: 13 });
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [pins.length, properties]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[600px] rounded-xl border border-gray-200 overflow-hidden bg-gray-100" />
      {pins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}
