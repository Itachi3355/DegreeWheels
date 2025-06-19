import React from 'react'
import { 
  TruckIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

const DashboardStats = ({ myRides, myRequests, incomingRequests }) => {
  const activeRides = myRides.filter(ride => ride.status === 'active').length
  const confirmedRequests = myRequests.filter(req => req.status === 'confirmed').length
  const pendingRequests = myRequests.filter(req => req.status === 'pending').length

  const stats = [
    {
      name: 'Active Rides',
      value: activeRides,
      icon: TruckIcon,
      color: 'bg-blue-500',
      description: 'Rides you\'re offering'
    },
    {
      name: 'Confirmed Bookings',
      value: confirmedRequests,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      description: 'Rides you\'re joining'
    },
    {
      name: 'Pending Requests',
      value: pendingRequests,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      description: 'Awaiting approval'
    },
    {
      name: 'Incoming Requests',
      value: incomingRequests.length,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      description: 'People want to join'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`${stat.color} rounded-lg p-3 mr-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-900">{stat.name}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats