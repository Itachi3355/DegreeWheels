// File: src/components/rides/ChatMessage.jsx
import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MapPinIcon } from '@heroicons/react/24/outline'

const ChatMessage = ({ message, isOwn, showSender }) => {
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'location':
        const coords = message.metadata?.coordinates
        return (
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4" />
            <span>Shared location</span>
            {coords && (
              <a
                href={`https://maps.google.com/maps?q=${coords[1]},${coords[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                View on map
              </a>
            )}
          </div>
        )
      case 'system':
        return (
          <div className="text-gray-600 italic text-center">
            {message.content}
          </div>
        )
      default:
        return message.content
    }
  }

  if (message.message_type === 'system') {
    return (
      <div className="text-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full inline-block">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        {showSender && !isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-2">
            {message.sender?.full_name || message.sender?.email}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {renderMessageContent()}
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage