// File: src/components/common/BrowserHelp.jsx
// Create this component to help users with WebGL issues

import React from 'react'

const BrowserHelp = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-yellow-800 font-medium mb-2">🔧 Enable Hardware Acceleration</h3>
      <div className="text-sm text-yellow-700 space-y-2">
        <div>
          <strong>Chrome:</strong> Settings → Advanced → System → "Use hardware acceleration when available"
        </div>
        <div>
          <strong>Firefox:</strong> about:config → layers.acceleration.force-enabled → true
        </div>
        <div>
          <strong>Safari:</strong> Develop → Experimental Features → WebGL 2.0
        </div>
      </div>
    </div>
  )
}

export default BrowserHelp