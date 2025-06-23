import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  MapPinIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import useChat from '../../hooks/useChat' // ✅ Default import instead of named import
import ChatMessage from './ChatMessage'
import ChatParticipants from './ChatParticipants'

const ChatModal = ({ rideId, isOpen = true, onClose, onBookingUpdate }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  
  const {
    messages,
    participants,
    sendMessage,
    shareLocation,
    loading,
    error
  } = useChat(rideId, isOpen)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages]) // Trigger when messages array changes

  // Also scroll to bottom when modal opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          })
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  }, [isOpen, messages.length])

  // Refresh bookings in parent component when modal opens
  useEffect(() => {
    if (isOpen && onBookingUpdate) {
      onBookingUpdate() // This should trigger a bookings refresh in parent
    }
  }, [isOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!message.trim()) return

    try {
      setIsTyping(true)
      await sendMessage(message.trim())
      setMessage('')
      
      // ✅ Force scroll after sending
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          })
        }
      }, 100)
      
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleInputChange = (e) => {
    e.stopPropagation() // ✅ Prevent event bubbling
    setMessage(e.target.value)
  }

  const handleModalClick = (e) => {
    e.stopPropagation() // ✅ Prevent modal from closing when clicking inside
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick} // ✅ Only close when clicking overlay
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md h-96 flex flex-col"
        onClick={handleModalClick} // ✅ Prevent clicks inside modal from bubbling
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Ride Chat
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="Refresh messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-64">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {/* This anchor should be at the end */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isTyping}
                onClick={(e) => e.stopPropagation()} // ✅ Prevent input clicks from bubbling
              />
              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                onClick={(e) => e.stopPropagation()} // ✅ Prevent button clicks from bubbling
              >
                {isTyping ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatModal