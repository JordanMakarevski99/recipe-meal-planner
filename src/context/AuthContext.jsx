import React, { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('recipeAppUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error)
      localStorage.removeItem('recipeAppUser')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(userData => {
    const fakeUser = {
      id: Date.now(),
      email: userData.email,
      name: userData.email.split('@')[0]
    }
    localStorage.setItem('recipeAppUser', JSON.stringify(fakeUser))
    setUser(fakeUser)

    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('recipeAppUser')

    localStorage.removeItem('recipeAppData')
    setUser(null)
  }, [])

  const value = { user, login, logout, loading, isAuthenticated: !!user }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}