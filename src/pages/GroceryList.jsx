import React, { useEffect, useState } from 'react'
import { useData } from '../hooks/useData'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  ListBulletIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

function GroceryList () {
  const {
    groceryList,
    generateGroceryList,
    loadingData,
    error,
    setError,
    mealPlan
  } = useData()
  const [isGenerated, setIsGenerated] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const [expectedRecipes, setExpectedRecipes] = useState([])

  const isMealPlanEmpty = Object.values(mealPlan).every(dayMeals =>
    Object.values(dayMeals).every(recipe => recipe === null)
  )

  useEffect(() => {
    const recipes = []
    Object.entries(mealPlan).forEach(([day, meals]) => {
      Object.entries(meals).forEach(([meal, recipe]) => {
        if (recipe) {
          recipes.push({
            day,
            meal,
            recipe
          })
        }
      })
    })
    setExpectedRecipes(recipes)

    if (recipes.length > 0 && (!groceryList || groceryList.length === 0)) {
      setIsGenerated(false)
    }
  }, [mealPlan, groceryList])

  const handleGenerate = async () => {
    try {
      setError(null)
      setIsGenerated(false)
      setLocalLoading(true)
      await generateGroceryList()
      setIsGenerated(true)
    } catch (err) {
      console.error('Error generating grocery list:', err)
      setError(
        `Failed to generate grocery list: ${err.message || 'Unknown error'}`
      )
    } finally {
      setLocalLoading(false)
    }
  }

  useEffect(() => {
    if (groceryList && groceryList.length > 0) {
      setIsGenerated(true)
    } else if (!isMealPlanEmpty) {
      handleGenerate()
    } else {
      setIsGenerated(true)
    }
  }, [])

  const formatDayMeal = (day, meal) =>
    `${day.charAt(0).toUpperCase() + day.slice(1)} - ${
      meal.charAt(0).toUpperCase() + meal.slice(1)
    }`

  const hasMissingRecipes = () => {
    if (!groceryList || groceryList.length === 0) return false

    const mealPlanRecipeIds = new Set()
    Object.values(mealPlan).forEach(meals => {
      Object.values(meals).forEach(recipe => {
        if (recipe) mealPlanRecipeIds.add(recipe.id)
      })
    })

    const groceryListRecipeIds = new Set(
      groceryList.map(item => item?.recipe?.id).filter(Boolean)
    )

    return mealPlanRecipeIds.size > groceryListRecipeIds.size
  }

  const isLoading = loadingData || localLoading

  return (
    <div className='max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 flex items-center'>
          <ShoppingCartIcon className='w-7 h-7 mr-2 text-secondary' /> Grocery
          List
        </h1>
        <Button
          onClick={handleGenerate}
          isLoading={isLoading}
          disabled={isLoading || isMealPlanEmpty}
          variant='secondary'
          title={
            isMealPlanEmpty
              ? 'Add items to your meal plan first'
              : 'Regenerate list from current meal plan'
          }
        >
          <ArrowPathIcon
            className={`w-5 h-5 mr-2 ${
              isLoading ? '' : 'group-hover:animate-spin'
            }`}
          />
          {isLoading ? 'Generating...' : 'Generate/Update List'}
        </Button>
      </div>

      {error && (
        <p className='text-center text-red-600 font-medium mb-4 bg-red-100 p-3 rounded-md'>
          {error}
        </p>
      )}

      {hasMissingRecipes() && !isLoading && (
        <div className='text-center text-amber-600 font-medium mb-4 bg-amber-50 p-3 rounded-md'>
          <ExclamationTriangleIcon className='w-5 h-5 inline-block mr-2' />
          Some recipes from your meal plan are missing from the grocery list.
          Try regenerating the list.
        </div>
      )}

      {isLoading && (
        <LoadingSpinner message='Generating your grocery list...' />
      )}

      {!isLoading && isGenerated && (!groceryList || groceryList.length === 0) && (
        <div className='text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
          <ListBulletIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-lg font-medium text-gray-800'>
            Your Grocery List is Empty
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            {isMealPlanEmpty
              ? 'Add some meals to your planner first, then generate the list.'
              : 'No recipes found in your current meal plan, or failed to fetch details.'}
          </p>
          {!isMealPlanEmpty && (
            <Button
              onClick={handleGenerate}
              size='sm'
              variant='primary'
              className='mt-4'
            >
              Try Generating Again
            </Button>
          )}
        </div>
      )}

      {!isLoading && groceryList && groceryList.length > 0 && (
        <div className='space-y-6'>
          {groceryList.map((entry, index) => {
            if (!entry || !entry.recipe) {
              console.warn(
                '[GroceryList] Skipping rendering for invalid entry:',
                entry
              )
              return null
            }

            return (
              <div
                key={`${entry.day}-${entry.meal}-${entry.recipe.id}-${index}`}
                className='border border-gray-200 rounded-lg overflow-hidden shadow-sm'
              >
                <div className='bg-gray-100 p-3 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    {entry.recipe?.title || 'Recipe Title Missing'}
                  </h2>
                  <p className='text-sm text-primary font-medium'>
                    {formatDayMeal(
                      entry.day || 'Unknown Day',
                      entry.meal || 'Unknown Meal'
                    )}
                  </p>
                </div>

                <div className='p-4'>
                  {entry.fetchError ? (
                    <div className='flex items-center text-sm text-red-600 bg-red-50 p-2 rounded'>
                      <ExclamationTriangleIcon className='w-5 h-5 mr-2 flex-shrink-0' />
                      <span>
                        Could not load ingredients: {entry.fetchError}
                      </span>
                    </div>
                  ) : !entry.ingredients ||
                    !Array.isArray(entry.ingredients) ? (
                    <div className='flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded'>
                      <ExclamationTriangleIcon className='w-5 h-5 mr-2 flex-shrink-0' />
                      <span>
                        Missing ingredient data.
                        <Button
                          onClick={handleGenerate}
                          size='sm'
                          variant='link'
                          className='ml-2 underline'
                        >
                          Try regenerating the list
                        </Button>
                      </span>
                    </div>
                  ) : entry.ingredients.length === 0 ? (
                    <p className='text-sm text-gray-500 italic'>
                      No ingredient details provided for this recipe.
                    </p>
                  ) : (
                    <ul className='space-y-2'>
                      {entry.ingredients.map((ingredient, idx) => (
                        <li
                          key={
                            ingredient.id ||
                            ingredient.original ||
                            `ingredient-${idx}`
                          }
                          className='flex items-center text-sm text-gray-700'
                        >
                          <CheckCircleIcon className='w-4 h-4 mr-2 text-emerald-500 flex-shrink-0' />
                          <span>
                            {ingredient.original ||
                              ingredient.name ||
                              'Unknown ingredient'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {expectedRecipes.length > 0 &&
        groceryList &&
        expectedRecipes.length > groceryList.length &&
        !isLoading && (
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-800 mb-3'>
              Recipes Not Yet in Grocery List
            </h2>
            <div className='space-y-2 bg-gray-50 p-4 rounded-lg'>
              {expectedRecipes
                .filter(
                  expected =>
                    !groceryList.some(
                      item => item?.recipe?.id === expected.recipe.id
                    )
                )
                .map((missing, idx) => (
                  <div
                    key={`missing-${missing.recipe.id}-${idx}`}
                    className='flex items-center'
                  >
                    <ExclamationTriangleIcon className='w-4 h-4 mr-2 text-amber-500' />
                    <span className='text-sm'>
                      {missing.recipe.title}
                      <span className='text-gray-500 ml-2 text-xs'>
                        ({formatDayMeal(missing.day, missing.meal)})
                      </span>
                    </span>
                  </div>
                ))}
              <Button
                onClick={handleGenerate}
                size='sm'
                variant='primary'
                className='mt-2'
              >
                Regenerate List to Include All Recipes
              </Button>
            </div>
          </div>
        )}
    </div>
  )
}

export default GroceryList