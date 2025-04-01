import React, { useState, useEffect } from 'react'
import {
  searchMealsByName,
  filterMealsByIngredient,
  getRandomMeal
} from '../services/themealdbApi'
import RecipeCard from '../components/RecipeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/ui/Button'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'

function RecipeSearch () {
  const [searchTerm, setSearchTerm] = useState('')

  const [searchType, setSearchType] = useState('query')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const [suggestedRecipes, setSuggestedRecipes] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [suggestionError, setSuggestionError] = useState(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true)
      setSuggestionError(null)
      setSuggestedRecipes([])
      const suggestions = []
      const numberOfSuggestions = 8

      try {
        for (let i = 0; i < numberOfSuggestions; i++) {
          const result = await getRandomMeal()
          if (result.data && !result.error) {
            suggestions.push(result.data)
          } else if (result.error) {
            throw new Error(result.message || 'Failed to fetch a random meal')
          }
        }

        const filteredData = suggestions.filter(recipe => recipe.strMeal)
        setSuggestedRecipes(filteredData)
      } catch (err) {
        console.error('[RecipeSearch] Suggestion fetch critical error:', err)
        setSuggestionError(err.message || 'Could not load suggestions.')
        setSuggestedRecipes([])
      } finally {
        setLoadingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [])

  const handleSearch = async e => {
    if (e) e.preventDefault()
    if (!searchTerm.trim()) {
      setError(
        `Please enter a ${
          searchType === 'query' ? 'meal name' : 'main ingredient'
        }.`
      )
      setRecipes([])
      setSearched(false)
      return
    }
    setLoading(true)
    setError(null)
    setSearched(true)
    setRecipes([])

    try {
      let result
      if (searchType === 'ingredient') {
        result = await filterMealsByIngredient(searchTerm)
      } else {
        result = await searchMealsByName(searchTerm)
      }

      if (result.error) {
        setError(result.message)
        setRecipes([])
      } else if (result.data && result.data.length > 0) {
        const formattedData = result.data.map(meal => ({
          id: meal.idMeal,
          title: meal.strMeal,
          image: meal.strMealThumb
        }))
        setRecipes(formattedData)
      } else {
        setRecipes([])
      }
    } catch (err) {
      setError('An unexpected error occurred during the search.')
      console.error('Search Error:', err)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (error) setError(null)
  }, [searchTerm, searchType])

  return (
    <div className='max-w-6xl mx-auto'>
      <h1 className='text-3xl md:text-4xl font-bold mb-6 text-center text-gray-700'>
        Discover Your Next Meal
      </h1>
      <form
        onSubmit={handleSearch}
        className='mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200'
      >
        <div className='flex items-center border-b border-gray-200 pb-3 mb-3'>
          <label className='mr-4 text-sm font-medium text-gray-700'>
            Search by:
          </label>
          <div className='flex space-x-4'>
            <label className='flex items-center cursor-pointer'>
              <input
                type='radio'
                name='searchType'
                value='query'
                checked={searchType === 'query'}
                onChange={() => setSearchType('query')}
                className='form-radio h-4 w-4 text-primary focus:ring-primary border-gray-300'
              />
              <span className='ml-2 text-sm text-gray-600'>
                Recipe Name / Keywords
              </span>
            </label>

            <label className='flex items-center cursor-pointer'>
              <input
                type='radio'
                name='searchType'
                value='ingredient'
                checked={searchType === 'ingredient'}
                onChange={() => setSearchType('ingredient')}
                className='form-radio h-4 w-4 text-primary focus:ring-primary border-gray-300'
              />
              <span className='ml-2 text-sm text-gray-600'>
                Main Ingredient (One)
              </span>
            </label>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              searchType === 'ingredient'
                ? 'e.g., Chicken Breast, Salmon, Beef'
                : 'e.g., Arrabiata, Sushi, Pasta Bake'
            }
            className='flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150'
          />
          <Button
            type='submit'
            disabled={loading || !searchTerm.trim()}
            isLoading={loading}
            className='w-full sm:w-auto'
          >
            <MagnifyingGlassIcon className='w-5 h-5 mr-2' />
            {loading ? 'Searching...' : 'Search Recipes'}
          </Button>
        </div>
        {error && (
          <p className='text-red-500 text-sm mt-3 text-center font-medium'>
            {error}
          </p>
        )}
      </form>

      <div className='mt-10'>
        {searched && (
          <>
            {loading && <LoadingSpinner message='Searching...' />}
            {!loading && recipes.length === 0 && (
              <div className='text-center py-10 px-4 bg-white rounded-lg shadow border border-gray-200'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    vectorEffect='non-scaling-stroke'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
                <h3 className='mt-2 text-lg font-medium text-gray-800'>
                  No Recipes Found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  We couldn't find any recipes matching "{searchTerm}". Try
                  different terms.
                </p>
              </div>
            )}
            {!loading && recipes.length > 0 && (
              <>
                <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
                  Search Results
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6'>
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={`search-${recipe.id}`}
                      recipe={recipe}
                      source='search'
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!searched && (
          <>
            {loadingSuggestions && (
              <LoadingSpinner message='Loading suggestions...' />
            )}
            {!loadingSuggestions && suggestionError && (
              <p className='text-center text-orange-600 font-medium mt-6 bg-orange-100 p-3 rounded-md'>
                Could not load suggestions: {suggestionError}
              </p>
            )}
            {!loadingSuggestions &&
              !suggestionError &&
              suggestedRecipes.length === 0 && (
                <p className='text-center text-gray-500 mt-6'>
                  No suggestions available at the moment. Try searching above!
                </p>
              )}
            {!loadingSuggestions &&
              !suggestionError &&
              suggestedRecipes.length > 0 && (
                <>
                  <h2 className='text-2xl font-semibold mb-4 text-gray-700 flex items-center'>
                    <SparklesIcon className='w-6 h-6 mr-2 text-amber-500' />
                    Recipe Suggestions
                  </h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6'>
                    {suggestedRecipes.map(recipe => (
                      <RecipeCard
                        key={`suggest-${recipe.idMeal}`}
                        recipe={{
                          id: recipe.idMeal,
                          title: recipe.strMeal,
                          image: recipe.strMealThumb
                        }}
                        source='suggestion'
                      />
                    ))}
                  </div>
                </>
              )}
          </>
        )}
      </div>
    </div>
  )
}

export default RecipeSearch