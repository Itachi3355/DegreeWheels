// Create: src/components/common/Logo.jsx
import React from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'

const Logo = ({ size = 'normal' }) => {
  const textSize = size === 'large' ? 'text-3xl' : size === 'small' ? 'text-lg' : 'text-2xl'
  const tagSize = size === 'large' ? 'text-sm' : size === 'small' ? 'text-xs' : 'text-xs'
  
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        <AcademicCapIcon className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-blue-600`} />
        <div className="flex flex-col">
          <span className={`${textSize} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            DegreeWheels
          </span>
          <span className={`${tagSize} text-gray-500 font-medium tracking-widest -mt-1`}>
            MEET • MOVE • SHARE • STUDY
          </span>
        </div>
      </div>
    </div>
  )
}

export default Logo