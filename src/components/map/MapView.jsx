import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGeolocation } from '../../hooks/useGeolocation';
import './MapView.css';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const MapView = ({ rideRoutes }) => {
  const mapContainerRef = useRef(null);
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: 12,
    });

    map.on('load', () => {
      rideRoutes.forEach(route => {
        map.addSource(route.id, {
          type: 'geojson',
          data: route.geojson,
        });

        map.addLayer({
          id: route.id,
          type: 'line',
          source: route.id,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#888',
            'line-width': 8,
          },
        });
      });
    });

    return () => map.remove();
  }, [latitude, longitude, rideRoutes]);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default MapView;