import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    lat || 36.8065, // Default: Tunis
    lng || 10.1815,
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
      setMapKey(prev => prev + 1);
    }
  }, [lat, lng]);

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setPosition([newLat, newLng]);
    onLocationChange(newLat, newLng);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) for geocoding - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        handleLocationSelect(newLat, newLng);
        setMapKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const center = useMemo<LatLngExpression>(() => position, [position]);
  const markerPosition = useMemo<LatLngExpression>(() => position, [position]);

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation sur la carte (optionnel)
        </Label>
        
        {/* Search box */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Rechercher une adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Map */}
        <div className="h-64 rounded-lg overflow-hidden border border-border">
          <MapContainer
            key={mapKey}
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={markerPosition} />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
          </MapContainer>
        </div>

        {/* Coordinates display */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="display_lat" className="text-xs">Latitude</Label>
            <Input
              id="display_lat"
              type="number"
              step="any"
              value={position[0].toFixed(6)}
              onChange={(e) => {
                const newLat = parseFloat(e.target.value);
                if (!isNaN(newLat)) {
                  handleLocationSelect(newLat, position[1]);
                }
              }}
              placeholder="Ex: 36.8065"
            />
          </div>
          <div>
            <Label htmlFor="display_lng" className="text-xs">Longitude</Label>
            <Input
              id="display_lng"
              type="number"
              step="any"
              value={position[1].toFixed(6)}
              onChange={(e) => {
                const newLng = parseFloat(e.target.value);
                if (!isNaN(newLng)) {
                  handleLocationSelect(position[0], newLng);
                }
              }}
              placeholder="Ex: 10.1815"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Cliquez sur la carte pour placer le marqueur ou recherchez une adresse
        </p>
      </div>
    </div>
  );
}
