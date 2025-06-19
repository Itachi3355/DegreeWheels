import React, { useState } from 'react'
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline'
import EditRequestModal from './EditRequestModal'
import toast from 'react-hot-toast'

const MyRequests = ({ requests = [], onCancelRequest, onMarkAsFound, onRefetch }) => {
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    status: 'all'
  })
  const [editingRequest, setEditingRequest] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Filter requests based on search criteria
  const filteredRequests = requests.filter(request => {
    const matchesOrigin = !filters.origin || 
      request.origin?.toLowerCase().includes(filters.origin.toLowerCase())
    const matchesDestination = !filters.destination || 
      request.destination?.toLowerCase().includes(filters.destination.toLowerCase())
    const matchesStatus = filters.status === 'all' || request.status === filters.status

    return matchesOrigin && matchesDestination && matchesStatus
  })

  const clearFilters = () => {
    setFilters({ origin: '', destination: '', status: 'all' })
  }

  // Handle Cancel Request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) {
      return
    }

    try {
      const result = await onCancelRequest(requestId)
      if (result.success) {
        toast.success('Ride request cancelled successfully')
      } else {
        toast.error('Failed to cancel request')
      }
    } catch (error) {
      toast.error('Failed to cancel request')
    }
  }

  // Handle Mark as Found
  const handleMarkAsFound = async (requestId) => {
    if (!window.confirm('Mark this request as completed? This will close the request.')) {
      return
    }

    try {
      const result = await onMarkAsFound(requestId)
      if (result.success) {
        toast.success('Request marked as completed!')
      } else {
        toast.error('Failed to update request')
      }
    } catch (error) {
      toast.error('Failed to update request')
    }
  }

  // Handle Edit Request
  const handleEditRequest = (request) => {
    setEditingRequest(request)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingRequest(null)
    if (onRefetch) {
      onRefetch()
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 9h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No ride requests yet</h3>
        <p className="text-gray-600">Post a ride request to find fellow students going your way</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'matched': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date flexible'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Date flexible'
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Date flexible'
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Time flexible'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Time flexible'
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return 'Time flexible'
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filter My Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                placeholder="Origin"
                value={filters.origin}
                onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                placeholder="Destination"
                value={filters.destination}
                onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="open">Open</option>
                <option value="matched">Matched</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No requests match your current filters.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                          🙋‍♂️ Looking for a ride
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Active'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Posted {formatDate(request.created_at)}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center mb-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                          <span className="font-medium text-gray-900">
                            {request.origin || 'Origin not specified'}
                          </span>
                        </div>
                      </div>
                      <div className="mx-4 text-gray-400 text-xl">→</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                          <span className="font-medium text-gray-900">
                            {request.destination || 'Destination not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>
                          {request.preferred_departure_time 
                            ? `${formatDate(request.preferred_departure_time)} at ${formatTime(request.preferred_departure_time)}`
                            : 'Time flexible'
                        }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>Seats needed: 1</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        <span>
                          Max price: {request.max_price ? `$${request.max_price}` : 'Negotiable'}
                        </span>
                      </div>
                    </div>

                    {/* Additional Details */}
                    {request.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleEditRequest(request)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit Request
                        </button>
                        {request.status === 'open' && (
                          <button 
                            onClick={() => handleMarkAsFound(request.id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Mark as Found
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {request.status === 'open' && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditRequestModal
        request={editingRequest}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingRequest(null)
        }}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

export default MyRequests