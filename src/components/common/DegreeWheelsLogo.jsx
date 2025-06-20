// Create: src/components/common/DegreeWheelsLogo.jsx
import React from 'react'
import { motion } from 'framer-motion'

const DegreeWheelsLogo = ({ size = "md", showText = true, animate = false }) => {
  const sizeClasses = {
    xs: { icon: "w-4 h-4", text: "text-sm", container: "w-6 h-6", mmss: "w-3 h-3" },
    sm: { icon: "w-5 h-5", text: "text-base", container: "w-8 h-8", mmss: "w-3 h-3" },
    md: { icon: "w-6 h-6", text: "text-2xl", container: "w-12 h-12", mmss: "w-4 h-4" },
    lg: { icon: "w-8 h-8", text: "text-3xl", container: "w-14 h-14", mmss: "w-5 h-5" },
    xl: { icon: "w-10 h-10", text: "text-4xl", container: "w-16 h-16", mmss: "w-6 h-6" }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon - MINIMALIST NO-SPOKES TIRE */}
      <div className={`${sizeClasses[size].container} bg-black rounded-full flex items-center justify-center shadow-lg relative border-2 border-gray-300`}>
        
        {/* MINIMALIST TIRE - NO SPOKES, JUST RIM */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: animate ? 8 : 0,
            repeat: animate ? Infinity : 0, 
            ease: "linear" 
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* MINIMALIST RIM DESIGN - No Spokes */}
          <svg className="absolute inset-0 w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <g opacity="0.8">
              {/* Outer rim circles */}
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="12" cy="12" r="8.5" strokeWidth="1" opacity="0.4"/>
              <circle cx="12" cy="12" r="7" strokeWidth="0.8" opacity="0.3"/>
              
              {/* Subtle tire tread marks - rotating */}
              <circle cx="12" cy="12" r="9.2" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 4"/>
            </g>
          </svg>
          
          {/* Center hub - solid white */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`bg-white rounded-full shadow-inner ${
              size === 'xs' ? 'w-3 h-3' :
              size === 'sm' ? 'w-4 h-4' :
              size === 'md' ? 'w-5 h-5' :
              size === 'lg' ? 'w-6 h-6' :
              'w-7 h-7'
            }`}>
              {/* Inner hub detail */}
              <div className={`bg-gray-200 rounded-full m-0.5 ${
                size === 'xs' ? 'w-2 h-2' :
                size === 'sm' ? 'w-3 h-3' :
                size === 'md' ? 'w-4 h-4' :
                size === 'lg' ? 'w-5 h-5' :
                'w-6 h-6'
              }`}></div>
            </div>
          </div>
        </motion.div>
        
        {/* FIXED DEGREE SYMBOL - Never rotates */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className={`text-white drop-shadow-lg ${
            size === 'xs' ? 'text-sm' :
            size === 'sm' ? 'text-base' :
            size === 'md' ? 'text-lg' :
            size === 'lg' ? 'text-xl' :
            'text-2xl'
          }`} role="img" aria-label="degree">
            🎓
          </span>
        </div>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex items-center space-x-2">
          <span className={`${sizeClasses[size].text} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            DegreeWheels
          </span>
          
          {/* MMSS Pills */}
          <div className="flex space-x-1">
            {[
              { letter: 'M', color: 'from-blue-500 to-blue-600', tooltip: 'Meet' },
              { letter: 'M', color: 'from-green-500 to-green-600', tooltip: 'Move' },
              { letter: 'S', color: 'from-purple-500 to-purple-600', tooltip: 'Share' },
              { letter: 'S', color: 'from-orange-500 to-orange-600', tooltip: 'Save' }
            ].map((item, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.2, rotate: 5 }}
                title={item.tooltip}
                className={`${sizeClasses[size].mmss} bg-gradient-to-r ${item.color} text-white text-xs font-bold rounded-full flex items-center justify-center cursor-help shadow-sm hover:shadow-md transition-shadow`}
              >
                {item.letter}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DegreeWheelsLogo