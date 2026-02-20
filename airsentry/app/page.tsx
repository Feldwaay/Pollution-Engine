"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/events")
        .then((res) => res.json())
        .then((result) => setData(result));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div style={{ padding: 60 }}>Loading AirSentry...</div>;
  }

  const classification = data.classification;
  const spike = data.spike;

  const spikeRatio = spike?.rollingAverage
    ? (data.currentAQI / spike.rollingAverage).toFixed(2)
    : null;

  const labelColor =
    classification.label === "Likely Industrial"
      ? "#ff4d4d"
      : classification.label === "Likely Vehicular"
      ? "#ff9900"
      : classification.label === "Likely Regional Transport"
      ? "#00b3ff"
      : classification.label === "Likely Agricultural Burning"
      ? "#cc00ff"
      : "#ffffff";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
        padding: "40px 60px",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 38, marginBottom: 5 }}>AirSentry</h1>
        <p style={{ opacity: 0.8 }}>
          Industrial Pollution Intelligence Dashboard — Delhi NCR
        </p>
      </div>

      {/* Top Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {[
          { title: "Current AQI", value: data.currentAQI },
          {
            title: "Rolling Average",
            value: spike?.rollingAverage?.toFixed(1),
          },
          {
            title: "Spike Ratio",
            value: spikeRatio ? `${spikeRatio}x` : "—",
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: 25,
              borderRadius: 14,
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ opacity: 0.7 }}>{item.title}</p>
            <h2 style={{ fontSize: 28, marginTop: 10 }}>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Spike + Classification Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 30,
        }}
      >
        {/* Spike Card */}
        <div
          style={{
            background: spike?.isSpike
              ? "rgba(255,0,0,0.15)"
              : "rgba(0,255,100,0.15)",
            padding: 30,
            borderRadius: 14,
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ marginBottom: 10 }}>
            {spike?.isSpike
              ? "Pollution Spike Detected"
              : "No Active Spike"}
          </h2>
          <p style={{ opacity: 0.8 }}>{spike?.reason}</p>
        </div>

        {/* Classification Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: 30,
            borderRadius: 14,
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ color: labelColor, marginBottom: 10 }}>
            {classification.label}
          </h2>

          <p>Confidence: {classification.confidence}%</p>

          <div
            style={{
              height: 12,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 6,
              marginTop: 10,
            }}
          >
            <div
              style={{
                width: `${classification.confidence}%`,
                height: "100%",
                background: labelColor,
                borderRadius: 6,
              }}
            />
          </div>

          <div style={{ marginTop: 20, opacity: 0.8 }}>
            <p>Industrial: {classification.industrialScore}</p>
            <p>Vehicular: {classification.vehicularScore}</p>
            <p>Regional: {classification.regionalScore}</p>
            <p>Agricultural: {classification.farmScore}</p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={{ marginTop: 40 }}>
        <MapView />
      </div>
    </main>
  );
}