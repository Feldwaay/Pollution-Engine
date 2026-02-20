"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useEffect } from "react";

/* ===============================
   Heat Layer Bridge Component
================================ */
function HeatLayer({ points }: { points: number[][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heat = (L as any).heatLayer(points, {
      radius: 70,
      blur: 50,
      maxZoom: 12,
      max: 1.0,
      gradient: {
        0.2: "green",
        0.4: "yellow",
        0.6: "orange",
        0.8: "red",
        1.0: "purple",
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

/* ===============================
   Main Map Component
================================ */
export default function MapView() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const delhiPosition: [number, number] = [28.6139, 77.209];

  /* ===============================
     Demo Industrial Zones
  ================================ */
  const industrialZones = [
    {
      name: "Okhla Industrial Area",
      position: [28.5245, 77.2793],
      aqi: 320,
      windDirection: 120,
      windSpeed: 3,
    },
    {
      name: "Bawana Industrial Area",
      position: [28.8062, 77.0337],
      aqi: 240,
      windDirection: 60,
      windSpeed: 5,
    },
    {
      name: "Narela Industrial Area",
      position: [28.857, 77.092],
      aqi: 180,
      windDirection: 200,
      windSpeed: 2,
    },
    {
      name: "Wazirpur Industrial Area",
      position: [28.69, 77.16],
      aqi: 270,
      windDirection: 300,
      windSpeed: 4,
    },
    {
      name: "Mayapuri Industrial Area",
      position: [28.6417, 77.129],
      aqi: 210,
      windDirection: 45,
      windSpeed: 3,
    },
  ];

  /* ===============================
     AQI Color Function
  ================================ */
  function getAQIColor(aqi: number) {
    if (aqi > 300) return "purple";
    if (aqi > 200) return "red";
    if (aqi > 150) return "orange";
    if (aqi > 100) return "yellow";
    return "green";
  }

  /* ===============================
     Heatmap Data
  ================================ */
  const heatData = industrialZones.map((zone) => {
    let intensity = 0.2;
  
    if (zone.aqi > 300) intensity = 1.0;
    else if (zone.aqi > 200) intensity = 0.8;
    else if (zone.aqi > 150) intensity = 0.6;
    else if (zone.aqi > 100) intensity = 0.4;
    else intensity = 0.2;
  
    return [zone.position[0], zone.position[1], intensity];
  }); 

  return (
    <div
      style={{
        height: "600px",
        width: "100%",
        marginTop: "40px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <MapContainer
        center={delhiPosition}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer */}
        <HeatLayer points={heatData} />

        {/* Wind Arrows */}
        {industrialZones.map((zone, index) => {
          const baseSize = 25 + zone.windSpeed * 5;

          const arrowIcon = L.divIcon({
            className: "",
            html: `<div style="
              transform: rotate(${zone.windDirection}deg);
              font-size: ${baseSize}px;
              font-weight: bold;
              color: ${getAQIColor(zone.aqi)};
              text-shadow: 0px 0px 6px black;
            ">↑</div>`,
            iconSize: [baseSize, baseSize],
            iconAnchor: [baseSize / 2, baseSize / 2],
          });

          return (
            <Marker
              key={index}
              position={zone.position as [number, number]}
              icon={arrowIcon}
            >
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                AQI: {zone.aqi}
                <br />
                Wind Direction: {zone.windDirection}°
                <br />
                Wind Speed: {zone.windSpeed} m/s
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          background: "#111",
          padding: "15px 20px",
          borderRadius: 10,
          color: "white",
          fontSize: 14,
          zIndex: 1000,
          boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
        }}
      >
        <strong>AQI Severity</strong>
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "green" }}>● Good (0–100)</div>
          <div style={{ color: "yellow" }}>● Moderate (101–150)</div>
          <div style={{ color: "orange" }}>● Unhealthy (151–200)</div>
          <div style={{ color: "red" }}>● Very Unhealthy (201–300)</div>
          <div style={{ color: "purple" }}>● Hazardous (300+)</div>
        </div>
      </div>
    </div>
  );
}