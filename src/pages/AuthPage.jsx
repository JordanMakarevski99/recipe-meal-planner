import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'

function AuthPage () {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/planner'

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      let success = false
      if (isLogin) {
        console.log('Simulating login for:', email)

        success = login({ email, password })
      } else {
        console.log('Simulating signup for:', email)

        success = login({ email, password })
      }

      if (success) {
        console.log('Login/Signup successful, navigating to:', from)
        navigate(from, { replace: true })
      } else {
        setError(
          isLogin
            ? 'Invalid email or password.'
            : 'Signup failed. Please try again.'
        )
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || (isLogin ? 'Login failed.' : 'Signup failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex justify-center items-center pt-10'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200'>
        <h2 className='text-2xl font-bold text-center text-gray-800'>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition'
              placeholder='you@example.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition'
              placeholder='••••••••'
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor='confirm-password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Confirm Password
              </label>
              <input
                id='confirm-password'
                name='confirmPassword'
                type='password'
                autoComplete='new-password'
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition'
                placeholder='••••••••'
              />
            </div>
          )}

          {error && (
            <p className='text-sm text-red-600 text-center font-medium bg-red-50 p-2 rounded-md'>
              {error}
            </p>
          )}

          <div>
            <Button
              type='submit'
              className='w-full justify-center'
              isLoading={loading}
              disabled={loading}
            >
              {loading
                ? isLogin
                  ? 'Logging in...'
                  : 'Signing up...'
                : isLogin
                ? 'Login'
                : 'Sign Up'}
            </Button>
          </div>
        </form>

        <p className='text-sm text-center text-gray-600'>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className='ml-1 font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline'
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage