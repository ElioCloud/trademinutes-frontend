"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

interface Task {
  id: string;
  title: string;
  description?: string;
  location: string;
  latitude: number;
  longitude: number;
  credits: number;
  locationType?: string;
  createdBy?: {
    name: string;
    avatar?: string;
  };
}

// Marker styles
const avatarIcon = (url: string) =>
  L.divIcon({
    html: `<div style="
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: url('${url}') center/cover no-repeat;
      box-shadow: 0 0 0 2px white;
    "></div>`,
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });

const userIcon = L.divIcon({
  html: `<div style="
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #1d4ed8;
    border: 2px solid white;
  "></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FlyToUserLocation({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 13);
  }, [position, map]);
  return null;
}

export default function TaskMap({ tasks }: { tasks: any[] }) {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(
    null
  );

  const normalizedTasks: Task[] = tasks
    .map((t: any) => ({
      id: t.ID,
      title: t.Title,
      description: t.Description,
      location: t.Location,
      latitude: t.Latitude,
      longitude: t.Longitude,
      credits: t.Credits,
      locationType: t.LocationType,
      createdBy: t.CreatedBy,
    }))
    .filter((task) => task.latitude !== 0 && task.longitude !== 0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLngExpression = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserLocation(coords);
      },
      (err) => {
        console.warn("Geolocation failed:", err.message);
        setUserLocation([43.6532, -79.3832]); // fallback to Toronto
      },
      { enableHighAccuracy: true }
    );
  }, []);

  if (!userLocation) {
    return (
      <div className="text-center text-gray-600">Getting your location...</div>
    );
  }

  console.log("normalizedTasks", normalizedTasks);
  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden">
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToUserLocation position={userLocation} />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {normalizedTasks.map((task) => {
          console.log("task", task);
          const avatar = task.createdBy?.avatar?.trim()
            ? task.createdBy.avatar
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
          const name = task.createdBy?.name || "Anonymous";

          return (
            <Marker
              key={task.id}
              position={[task.latitude, task.longitude]}
              icon={avatarIcon(avatar)}
            >
              <Popup>
                <div className="p-2 w-56">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={avatar}
                      alt={name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-gray-500">{task.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-yellow-500 font-medium mb-2">
                    💰 {task.credits} credits
                  </p>

                  <div className="grid grid-cols-2 gap-y-1 text-[11px] text-gray-600 mb-2">
                    <span className="font-medium">Location</span>
                    <span>{task.location}</span>
                    <span className="font-medium">Type</span>
                    <span>{task.locationType || "Unspecified"}</span>
                  </div>

                  <p className="text-[10px] text-gray-400 mb-1">
                    ID: {task.id}
                  </p>

                  <button className="w-full text-center text-xs py-2 rounded-md bg-green-100 text-green-800 font-medium">
                    View Task ↗
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
