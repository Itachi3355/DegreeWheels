import React, { useState } from 'react'
import { 
  UserIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

const IncomingRequests = ({ requests = [], onApprove, onReject }) => {
  const [statusFilter, setStatusFilter] = useState('pending')

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter requests based on the selected status
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  if (filteredRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-600">When people request to join your rides, they'll appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Filter Requests</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Recently Confirmed</option>
            <option value="all">All Requests</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Passenger Info */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-4">
                    {request.passenger?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {request.passenger?.full_name || 'Anonymous User'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <AcademicCapIcon className="w-4 h-4 mr-1" />
                      <span>{request.passenger?.university || 'University Student'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      <span>{request.passenger?.email || 'Email not available'}</span>
                    </div>
                  </div>
                </div>

                {/* Ride Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Ride Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium">{request.ride?.origin} → {request.ride?.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {new Date(request.ride?.departure_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">
                        {new Date(request.ride?.departure_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Message from passenger:</h4>
                    <p className="text-blue-800 text-sm">"{request.message}"</p>
                  </div>
                )}

                {/* Request Info */}
                <div className="text-sm text-gray-500">
                  Requested {formatDate(request.created_at)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-6">
                <button
                  onClick={() => onApprove(request.id)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IncomingRequests