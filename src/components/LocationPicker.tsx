import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ExternalLink } from "lucide-react";

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const [latitude, setLatitude] = useState<string>(lat?.toString() || "");
  const [longitude, setLongitude] = useState<string>(lng?.toString() || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleLatChange = (value: string) => {
    setLatitude(value);
    const newLat = parseFloat(value);
    const newLng = parseFloat(longitude);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      onLocationChange(newLat, newLng);
    }
  };

  const handleLngChange = (value: string) => {
    setLongitude(value);
    const newLat = parseFloat(latitude);
    const newLng = parseFloat(value);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      onLocationChange(newLat, newLng);
    }
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
        setLatitude(newLat.toFixed(6));
        setLongitude(newLng.toFixed(6));
        onLocationChange(newLat, newLng);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const openInGoogleMaps = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  const openInOpenStreetMap = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, '_blank');
    }
  };

  const hasValidCoordinates = !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation (optionnel)
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

        {/* Coordinates input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_lat" className="text-xs">Latitude</Label>
            <Input
              id="display_lat"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="Ex: 36.8065"
            />
          </div>
          <div>
            <Label htmlFor="display_lng" className="text-xs">Longitude</Label>
            <Input
              id="display_lng"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => handleLngChange(e.target.value)}
              placeholder="Ex: 10.1815"
            />
          </div>
        </div>

        {/* View on map buttons */}
        {hasValidCoordinates && (
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Google Maps
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInOpenStreetMap}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              OpenStreetMap
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          Recherchez une adresse ou saisissez les coordonnées GPS manuellement
        </p>
      </div>
    </div>
  );
}
