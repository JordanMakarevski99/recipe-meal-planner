import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import RecipeSearch from './pages/RecipeSearch'
import MealPlanner from './pages/MealPlanner'
import GroceryList from './pages/GroceryList'
import RecipeDetail from './pages/RecipeDetail'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute' // Import ProtectedRoute

function App () {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow container mx-auto px-4 py-8'>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<RecipeSearch />} />
          <Route path='/search' element={<RecipeSearch />} />
          <Route path='/recipe/:id' element={<RecipeDetail />} />
          <Route path='/auth' element={<AuthPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/planner' element={<MealPlanner />} />
            <Route path='/grocery-list' element={<GroceryList />} />
            {/* Add other protected routes here, e.g., saved recipes page */}
          </Route>

          {/* Fallback Route */}
          <Route
            path='*'
            element={
              <div className='text-center text-xl mt-10'>
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
