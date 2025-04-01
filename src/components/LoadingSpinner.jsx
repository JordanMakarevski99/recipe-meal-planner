import React from 'react'

function LoadingSpinner ({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4'
  }

  return (
    <div className='flex flex-col justify-center items-center my-10 text-center'>
      <div
        className={`animate-spin rounded-full border-t-transparent border-b-transparent border-emerald-500 ${
          sizeClasses[size] || sizeClasses.md
        }`}
      ></div>
      {message && <p className='mt-3 text-gray-600 text-sm'>{message}</p>}
    </div>
  )
}

export default LoadingSpinner
