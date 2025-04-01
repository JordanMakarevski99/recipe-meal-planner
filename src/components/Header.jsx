import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

function Header () {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation() // Get location object

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const getNavLinkClass = ({ isActive }) =>
    `py-1 block w-full text-left px-4 md:px-0 md:w-auto md:inline hover:text-emerald-200 transition-colors ${
      isActive ? 'font-semibold md:border-b-2 md:border-emerald-200' : ''
    } ${isActive && isMobileMenuOpen ? 'bg-emerald-700/50 rounded' : ''}` // Add background for active mobile link

  const authButtonBaseClass =
    'flex items-center text-xs font-bold py-1.5 px-3 rounded-md transition duration-150 shadow-sm w-full md:w-auto justify-center md:justify-start'

  return (
    <header className='bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg sticky top-0 z-50'>
      {/* Main Navigation Bar */}
      <nav className='container mx-auto px-4 py-3 flex justify-between items-center'>
        <Link
          to='/'
          className='text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity flex-shrink-0'
          onClick={() => setIsMobileMenuOpen(false)} // Close menu if logo clicked
        >
          Recipe<span className='text-emerald-200'>Planner</span>
        </Link>

        <ul className='hidden md:flex space-x-4 md:space-x-6 items-center text-sm md:text-base'>
          <li>
            <NavLink to='/search' className={getNavLinkClass}>
              Search
            </NavLink>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to='/planner' className={getNavLinkClass}>
                  Planner
                </NavLink>
              </li>
              <li>
                <NavLink to='/grocery-list' className={getNavLinkClass}>
                  Groceries
                </NavLink>
              </li>
            </>
          )}
          <li className='flex items-center'>
            {isAuthenticated && user ? (
              <div className='flex items-center space-x-3'>
                <span className='hidden md:inline text-sm font-medium'>
                  Hi, {user.name || 'User'}!
                </span>
                <button
                  onClick={handleLogout}
                  title='Logout'
                  className={`${authButtonBaseClass} bg-red-500 hover:bg-red-600 text-white`}
                >
                  <ArrowLeftOnRectangleIcon className='w-4 h-4 mr-1' />
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to='/auth'
                className={({ isActive }) =>
                  `${authButtonBaseClass} bg-white text-emerald-600 hover:bg-gray-100 ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-offset-emerald-600 ring-white'
                      : ''
                  }`
                }
              >
                <ArrowRightOnRectangleIcon className='w-4 h-4 mr-1' />
                Login
              </NavLink>
            )}
          </li>
        </ul>

        <div className='md:hidden'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-200 p-1 rounded'
            aria-label='Toggle menu'
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className='h-6 w-6' />
            ) : (
              <Bars3Icon className='h-6 w-6' />
            )}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg pb-4 pt-2 z-40 border-t border-emerald-400/30'>
          <ul className='container mx-auto px-4 flex flex-col space-y-3 text-base'>
            <li>
              <NavLink to='/search' className={getNavLinkClass}>
                Search
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to='/planner' className={getNavLinkClass}>
                    Planner
                  </NavLink>
                </li>
                <li>
                  <NavLink to='/grocery-list' className={getNavLinkClass}>
                    Groceries
                  </NavLink>
                </li>
              </>
            )}
            <li className='pt-3 border-t border-emerald-400/50'>
              {isAuthenticated && user ? (
                <div className='flex flex-col space-y-3 items-start'>
                  <span className='text-sm font-medium px-4'>
                    {' '}
                    Hi, {user.name || 'User'}!
                  </span>
                  <button
                    onClick={handleLogout}
                    title='Logout'
                    className={`${authButtonBaseClass} bg-red-500 hover:bg-red-600 text-white`}
                  >
                    <ArrowLeftOnRectangleIcon className='w-4 h-4 mr-1' />
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink
                  to='/auth'
                  className={({ isActive }) =>
                    `${authButtonBaseClass} bg-white text-emerald-600 hover:bg-gray-100 ${
                      isActive ? 'ring-2 ring-emerald-200' : ''
                    }`
                  }
                >
                  <ArrowRightOnRectangleIcon className='w-4 h-4 mr-1' />
                  Login
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header
