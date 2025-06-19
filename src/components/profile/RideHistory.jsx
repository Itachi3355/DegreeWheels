import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import './RideHistory.css';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRideHistory = async () => {
      const user = supabase.auth.user();
      if (user) {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching ride history:', error);
        } else {
          setRides(data);
        }
      }
      setLoading(false);
    };

    fetchRideHistory();
  }, []);

  if (loading) {
    return <div className="loading">Loading ride history...</div>;
  }

  return (
    <div className="ride-history">
      <h2>Your Ride History</h2>
      {rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <ul>
          {rides.map((ride) => (
            <li key={ride.id} className="ride-item">
              <p><strong>Ride ID:</strong> {ride.id}</p>
              <p><strong>Start Location:</strong> {ride.start_location}</p>
              <p><strong>End Location:</strong> {ride.end_location}</p>
              <p><strong>Date:</strong> {new Date(ride.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {ride.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RideHistory;