
"use client";

import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Stop = {
    name: string;
    description: string;
    cost: string;
    tip: string;
};

type MapStop = Stop & {
    lat: number;
    lon: number;
};

type ExperienceMapProps = {
    stops: Stop[];
};

const pinIcon = L.divIcon({
    html: `<div style="
        background:#593B32;
        color:#FFF8EE;
        border:3px solid #FFF8EE;
        border-radius:50%;
        width:32px;
        height:32px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        font-size:17px;
        box-shadow:0 2px 8px #593B3255;
    ">♥</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

function FitMapToStops({ stops }: { stops: MapStop[] }) {
    const map = useMap();

    useEffect(() => {
        if (stops.length === 0) return;

        if (stops.length === 1) {
            map.setView([stops[0].lat, stops[0].lon], 15);
            return;
        }

        const bounds = L.latLngBounds(
            stops.map((stop) => [stop.lat, stop.lon])
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
        });
    }, [map, stops]);

    return null;
}

export default function ExperienceMap({
                                          stops,
                                      }: ExperienceMapProps) {
    const [mappedStops, setMappedStops] = useState<MapStop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function findLocations() {
            setLoading(true);
            setMappedStops([]);

            const found: MapStop[] = [];

            // Look up locations sequentially to respect the
            // public geocoding service's rate limit.
            for (const stop of stops) {
                if (cancelled) return;

                try {
                    const query = encodeURIComponent(
                        `${stop.name}, New York City`
                    );

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
                    );

                    if (!response.ok) continue;

                    const results = await response.json();

                    if (results.length > 0) {
                        const lat = Number(results[0].lat);
                        const lon = Number(results[0].lon);

                        if (
                            Number.isFinite(lat) &&
                            Number.isFinite(lon)
                        ) {
                            found.push({
                                ...stop,
                                lat,
                                lon,
                            });
                        }
                    }
                } catch (error) {
                    console.error(
                        `Could not find ${stop.name}:`,
                        error
                    );
                }

                // Avoid rapid requests to the public geocoder.
                await new Promise((resolve) =>
                    setTimeout(resolve, 1100)
                );
            }

            if (!cancelled) {
                setMappedStops(found);
                setLoading(false);
            }
        }

        findLocations();

        return () => {
            cancelled = true;
        };
    }, [stops]);

    return (
        <div className="overflow-hidden rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] shadow-sm">
            <div className="p-5">
                <h3 className="text-lg font-bold text-[#593B32]">
                    Your NYC map 📍
                </h3>

                <p className="mt-1 text-sm text-[#765044]">
                    Explore the locations recommended for you.
                    Click a pin to learn more.
                </p>

                {loading && (
                    <p className="mt-3 text-sm text-[#A46B7C]">
                        Finding your recommended places...
                    </p>
                )}
            </div>

            <MapContainer
                center={[40.7306, -73.9866]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "360px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitMapToStops stops={mappedStops} />

                {mappedStops.map((stop, index) => (
                    <Marker
                        key={`${stop.name}-${index}`}
                        position={[stop.lat, stop.lon]}
                        icon={pinIcon}
                    >
                        <Popup>
                            <div>
                                <strong>{stop.name}</strong>
                                <p>{stop.description}</p>
                                <p>{stop.cost}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <p className="px-5 py-3 text-xs text-[#765044]">
                {loading
                    ? "Locating your stops..."
                    : `${mappedStops.length} of ${stops.length} recommended locations found.`}
                {" "}Locations are approximate; verify before visiting.
            </p>
        </div>
    );
}
