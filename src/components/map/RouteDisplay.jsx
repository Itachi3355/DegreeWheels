import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

const RouteDisplay = ({ route, startLocation, endLocation }) => {
  if (!route || !startLocation || !endLocation) {
    return <div>No route data available</div>;
  }

  return (
    <Map center={startLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={startLocation}>
        <Popup>Start Location</Popup>
      </Marker>
      <Marker position={endLocation}>
        <Popup>End Location</Popup>
      </Marker>
      {/* Additional route rendering logic can be added here */}
    </Map>
  );
};

export default RouteDisplay;