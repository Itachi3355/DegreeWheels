import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRideDetails, trackRide } from '../../services/api';
import MapView from '../map/MapView';
import Loading from '../common/Loading';

const RideTracking = () => {
  const { rideId } = useParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchRideDetails = async () => {
      const details = await getRideDetails(rideId);
      setRideDetails(details);
      setLoading(false);
    };

    fetchRideDetails();
  }, [rideId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (rideDetails) {
        trackRide(rideDetails.driverId).then(location => {
          setCurrentLocation(location);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [rideDetails]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="ride-tracking">
      <h2>Tracking Ride: {rideDetails.title}</h2>
      <div className="ride-info">
        <p>Driver: {rideDetails.driverName}</p>
        <p>Destination: {rideDetails.destination}</p>
        <p>Estimated Arrival: {rideDetails.estimatedArrival}</p>
      </div>
      <MapView currentLocation={currentLocation} route={rideDetails.route} />
    </div>
  );
};

export default RideTracking;