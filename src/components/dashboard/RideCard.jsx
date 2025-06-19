import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatModal from './ChatModal';
import { useAuth } from '../auth'; // Adjust the import based on your project structure

const RideCard = ({ ride, onRequestRide }) => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  // Check if user is part of this ride (driver or confirmed passenger)
  const isParticipant =
    ride.driver_id === user?.id ||
    ride.bookings?.some(
      (booking) => booking.passenger_id === user?.id && booking.status === 'confirmed'
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <h3>{ride.title}</h3>
      <p>
        <strong>Driver:</strong> {ride.driverName}
      </p>
      <p>
        <strong>Start:</strong> {ride.startLocation}
      </p>
      <p>
        <strong>End:</strong> {ride.endLocation}
      </p>
      <p>
        <strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Time:</strong> {new Date(ride.date).toLocaleTimeString()}
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Request Ride button */}
          <button
            onClick={() => onRequestRide(ride.id)}
            className="request-ride-button"
          >
            Request Ride
          </button>

          {/* Chat button for participants */}
          {isParticipant && (
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
              Chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        rideId={ride.id}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
};

export default RideCard;