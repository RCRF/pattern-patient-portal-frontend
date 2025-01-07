import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { getCoordinates } from "@/utils/helpers";

export default function Map({ providers, onMarkerClick, setProviders }) {
  const containerStyle = {
    height: "70vh",
    width: "100%",
  };

  const [updatedProviders, setUpdatedProviders] = useState(providers);

  useEffect(() => {
    if (providers) {
      // Get the coordinates for each provider
      const getProviderCoordinates = async () => {
        const updatedProviders = await Promise?.all(
          providers?.map(async (provider) => {
            const address = `${provider.institutions[0].address}, ${provider.institutions[0].city}, ${provider.institutions[0].state}`;
            const coordinates = await getCoordinates(address);
            if (coordinates) {
              const { latitude, longitude } = coordinates;
              provider.institutions[0].position = {
                lat: latitude,
                lng: longitude,
              };
            }
            return provider;
          })
        );
        // Update the providers with the new positions
        // and trigger a re-render
        setUpdatedProviders(updatedProviders);
      };

      getProviderCoordinates();
    }
  }, [providers]);

  return (
    <div className="h-1/3">
      {providers ? (
        <GoogleMap
          zoom={5}
          center={providers[0].institutions[0].position}
          mapContainerStyle={containerStyle}
        >
          {providers?.map((provider) => (
            <Marker
              key={provider.id}
              position={provider.institutions[0].position}
              onClick={() => onMarkerClick(provider.id)}
            />
          ))}
        </GoogleMap>
      ) : null}
    </div>
  );
}
