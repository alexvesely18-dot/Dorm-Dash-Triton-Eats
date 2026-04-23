"use client";

import { useEffect, useRef } from "react";
import type { Map as LMap, Marker } from "leaflet";

type Props = {
  hallLat: number;
  hallLng: number;
  hallName: string;
  hallEmoji: string;
  destLat: number;
  destLng: number;
  building: string;
  dasherLat?: number;
  dasherLng?: number;
};

function divIcon(L: typeof import("leaflet"), emoji: string, bg: string, size = 34) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "",
  });
}

export default function LiveMap({ hallLat, hallLng, hallName, hallEmoji, destLat, destLng, building, dasherLat, dasherLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<LMap | null>(null);
  const dasherRef     = useRef<Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let L: typeof import("leaflet");

    (async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as string);

      const midLat = dasherLat ?? (hallLat + destLat) / 2;
      const midLng = dasherLng ?? (hallLng + destLng) / 2;

      const map = L.map(containerRef.current!, {
        center: [midLat, midLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      // Dining hall pin
      L.marker([hallLat, hallLng], { icon: divIcon(L, hallEmoji, "#003087") })
        .addTo(map)
        .bindPopup(`<b>${hallName}</b>`);

      // Destination pin
      L.marker([destLat, destLng], { icon: divIcon(L, "🏠", "#F5B700") })
        .addTo(map)
        .bindPopup(`<b>${building}</b>`);

      // Dashed route line
      L.polyline([[hallLat, hallLng], [destLat, destLng]], {
        color: "#F5B700", weight: 3, dashArray: "8 5", opacity: 0.85,
      }).addTo(map);

      // Dasher pin (if location known)
      if (dasherLat && dasherLng) {
        dasherRef.current = L.marker([dasherLat, dasherLng], { icon: divIcon(L, "🛵", "#F5B700", 40), zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup("Your Dasher");
        map.setView([dasherLat, dasherLng], 15);
      }

      mapRef.current = map;
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      dasherRef.current = null;
    };
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update dasher marker whenever position changes
  useEffect(() => {
    if (!mapRef.current || !dasherLat || !dasherLng) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (dasherRef.current) {
        dasherRef.current.setLatLng([dasherLat, dasherLng]);
      } else {
        dasherRef.current = L.marker([dasherLat, dasherLng], {
          icon: divIcon(L, "🛵", "#F5B700", 40),
          zIndexOffset: 1000,
        }).addTo(mapRef.current!).bindPopup("Your Dasher");
      }
      mapRef.current!.panTo([dasherLat, dasherLng]);
    })();
  }, [dasherLat, dasherLng]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
