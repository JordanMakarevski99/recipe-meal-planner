import React from 'react'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out'

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-dark text-white focus:ring-primary disabled:bg-primary/70',
    secondary:
      'bg-secondary hover:bg-blue-600 text-white focus:ring-secondary disabled:bg-secondary/70',
    danger:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-600/70',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-primary disabled:text-gray-400',
    outline:
      'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary disabled:text-gray-400 disabled:border-gray-200'
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const disabledStyles = 'disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className={`animate-spin h-5 w-5 ${
            variant === 'primary' ||
            variant === 'secondary' ||
            variant === 'danger'
              ? 'text-white'
              : 'text-primary'
          }`}
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
