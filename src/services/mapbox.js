import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

export const initializeMap = (containerId, center, zoom) => {
  const map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: center,
    zoom: zoom,
  });

  map.addControl(new mapboxgl.NavigationControl());

  return map;
};

export const addMarker = (map, coordinates, popupText) => {
  const marker = new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup().setText(popupText))
    .addTo(map);

  return marker;
};

export const drawRoute = (map, routeCoordinates) => {
  map.on('load', () => {
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      },
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
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
};