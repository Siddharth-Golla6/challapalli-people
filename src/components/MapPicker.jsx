import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Leaflet's default marker icon references image files by relative URL, which
// breaks under bundlers (Vite included) since the assets get hashed/moved.
// Rebuild the icon from the package's own bundled images instead.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Center of Challapalli Gram Panchayat, used when no location is picked yet.
const DEFAULT_CENTER = { lat: 16.02, lng: 80.9 };
const DEFAULT_ZOOM = 11;
const PICKED_ZOOM = 15;

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

// Recenters/zooms the map imperatively whenever `value` changes from outside
// the map itself (e.g. "Locate Me", or a parent passing in a saved location).
function FlyToValue({ value }) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!value) return;
    map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), PICKED_ZOOM), {
      duration: hasFlown.current ? 0.8 : 0,
    });
    hasFlown.current = true;
  }, [value?.lat, value?.lng, map]);

  return null;
}

export default function MapPicker({ value, onChange, readOnly = false }) {
  const { t } = useLang();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const center = useMemo(() => (value ? [value.lat, value.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]), []); // eslint-disable-line react-hooks/exhaustive-deps

  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError(t("map.geoUnsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? t("map.permissionDenied")
            : err.message || t("map.couldNotFetch")
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!readOnly && (
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            <LocateFixed size={16} className={locating ? "animate-spin" : ""} />
            {locating ? t("map.locating") : t("map.locateMe")}
          </button>
        )}
        {value && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("map.latLng", { lat: value.lat.toFixed(6), lng: value.lng.toFixed(6) })}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-brand-red">{error}</p>}

      <div className="h-64 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <MapContainer
          center={center}
          zoom={value ? PICKED_ZOOM : DEFAULT_ZOOM}
          scrollWheelZoom
          touchZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && <ClickHandler onPick={onChange} />}
          <FlyToValue value={value} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={defaultIcon}
              draggable={!readOnly}
              eventHandlers={
                readOnly
                  ? undefined
                  : {
                      dragend: (e) => {
                        const pos = e.target.getLatLng();
                        onChange({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) });
                      },
                    }
              }
            >
              <Popup>{t("map.youAreHere")}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {!readOnly && !value && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {t("map.tapToPick")}
        </p>
      )}
    </div>
  );
}
