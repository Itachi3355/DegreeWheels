import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="w-full bg-white/80 border-t border-blue-100 py-4 mt-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
      <div className="mb-2 md:mb-0">
        © {new Date().getFullYear()} DegreeWheels. All rights reserved.
      </div>
      <div className="flex space-x-4">
        <Link to="/terms" className="hover:text-indigo-600 hover:underline">Terms</Link>
        <span>|</span>
        <Link to="/privacy" className="hover:text-indigo-600 hover:underline">Privacy</Link>
      </div>
    </div>
  </footer>
)

export default Footer
