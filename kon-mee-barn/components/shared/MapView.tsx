"use client";



interface MapViewProps {
  lat: number;
  lng: number;
  title: string;
}

export default function MapView({ lat, lng, title }: MapViewProps) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <iframe
        src={src}
        className="w-full h-64"
        title={`Map showing ${title}`}
        style={{ border: 0 }}
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-blue-500 hover:underline py-1.5 bg-gray-50"
      >
        View larger map
      </a>
    </div>
  );
}
