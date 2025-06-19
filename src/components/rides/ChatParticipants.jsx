// File: src/components/rides/ChatParticipants.jsx
import React from 'react'
import { UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const ChatParticipants = ({ participants }) => {
  return (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <UserGroupIcon className="w-4 h-4 text-gray-500" />
        <div className="flex items-center space-x-3">
          {participants.map((participant, index) => (
            <div key={participant.id} className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {participant.user?.full_name || participant.user?.email}
              </span>
              {index === 0 && (
                <CheckCircleIcon className="w-3 h-3 text-blue-500" title="Driver" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatParticipants