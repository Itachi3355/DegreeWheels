import React from 'react'
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline'

const MyRideRequests = ({ requests, onCancelRequest }) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No ride requests posted</h3>
        <p className="text-gray-600">Your ride requests will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {request.origin} → {request.destination}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {new Date(request.preferred_departure_time).toLocaleDateString()} at{' '}
                  {new Date(request.preferred_departure_time).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {request.max_price && (
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                    Max ${request.max_price}
                  </div>
                )}
              </div>

              {request.notes && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">
                  {request.notes}
                </p>
              )}

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 ${
                request.status === 'open' ? 'bg-green-100 text-green-800' :
                request.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
            
            {request.status === 'open' && (
              <button
                onClick={() => onCancelRequest(request.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Cancel Request"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyRideRequests