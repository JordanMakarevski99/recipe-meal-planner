import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMealDetailsById } from '../services/themealdbApi'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../hooks/useData'
import Button from '../components/ui/Button'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  LinkIcon,
  TagIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

function RecipeDetail () {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addSavedRecipe, removeSavedRecipe, isRecipeSaved } = useData()

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const saved = recipe?.idMeal ? isRecipeSaved(recipe.idMeal) : false

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getMealDetailsById(id)
        if (result.error) {
          setError(result.message)
          setRecipe(null)
        } else if (result.data) {
          setRecipe(result.data)
        } else {
          setError('Recipe not found.')
          setRecipe(null)
        }
      } catch (err) {
        setError('An unexpected error occurred loading the recipe.')
        console.error(err)
        setRecipe(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    if (!recipe || !recipe.idMeal) return

    const recipeToSave = {
      id: recipe.idMeal,
      title: recipe.strMeal,
      image: recipe.strMealThumb
    }

    if (saved) {
      removeSavedRecipe(recipe.idMeal)
    } else {
      addSavedRecipe(recipeToSave)
    }
  }

  const formatInstructions = instructions => {
    if (!instructions) return 'Instructions not available.'

    return instructions
      .replace(/\\r\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '<br />')
  }

  if (loading)
    return (
      <div className='flex justify-center pt-20'>
        <LoadingSpinner message='Fetching recipe details...' />
      </div>
    )
  if (error)
    return (
      <p className='text-center text-red-600 font-medium mt-10 bg-red-100 p-4 rounded-md max-w-md mx-auto'>
        {error}
      </p>
    )
  if (!recipe)
    return (
      <p className='text-center text-gray-500 mt-10'>
        Recipe data could not be loaded.
      </p>
    )

  return (
    <div className='max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200'>
      <Button
        onClick={() => navigate(-1)}
        variant='ghost'
        size='sm'
        className='mb-4 text-gray-600 hover:text-gray-900'
      >
        <ArrowLeftIcon className='w-4 h-4 mr-1' /> Back
      </Button>
      <h1 className='text-3xl md:text-4xl font-bold mb-3 text-gray-800'>
        {recipe.strMeal}
      </h1>

      <div className='flex flex-wrap gap-x-6 gap-y-2 items-center mb-6 text-sm text-gray-600 border-b pb-4'>
        {recipe.strCategory && (
          <span className='flex items-center'>
            <TagIcon className='w-4 h-4 mr-1.5 text-blue-500' /> Category:{' '}
            {recipe.strCategory}
          </span>
        )}
        {recipe.strArea && (
          <span className='flex items-center'>
            <TagIcon className='w-4 h-4 mr-1.5 text-green-500' /> Area:{' '}
            {recipe.strArea}
          </span>
        )}
      </div>

      {recipe.strTags && (
        <div className='flex flex-wrap gap-2 mb-6'>
          {recipe.strTags.split(',').map(
            tag =>
              tag.trim() && (
                <span
                  key={tag}
                  className='bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-gray-300'
                >
                  {tag.trim()}
                </span>
              )
          )}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-1 flex flex-col items-center space-y-4'>
          <img
            src={
              recipe.strMealThumb ||
              'https://via.placeholder.com/400x300/e2e8f0/64748b?text=No+Image'
            }
            alt={recipe.strMeal}
            className='w-full h-auto rounded-lg shadow-md border border-gray-200'
            onError={e => {
              e.target.onerror = null
              e.target.src =
                'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Load+Error'
            }}
          />
          <Button
            onClick={handleSaveToggle}
            variant={saved ? 'outline' : 'primary'}
            disabled={!isAuthenticated || !recipe.idMeal}
            className='w-full'
            title={
              !isAuthenticated
                ? 'Login to save'
                : saved
                ? 'Remove from Saved'
                : 'Save Recipe'
            }
          >
            {saved ? (
              <BookmarkSolidIcon className='w-5 h-5 mr-2 text-primary' />
            ) : (
              <BookmarkOutlineIcon className='w-5 h-5 mr-2' />
            )}
            {saved ? 'Saved' : 'Save Recipe'}
          </Button>
          {!isAuthenticated && (
            <p className='text-xs text-gray-500 -mt-3 text-center'>
              Login required to save.
            </p>
          )}

          <div className='w-full space-y-2 pt-2'>
            {recipe.strSource && (
              <a
                href={recipe.strSource}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
              >
                <LinkIcon className='w-4 h-4 mr-2 text-gray-500' />
                View Original Source
              </a>
            )}
            {recipe.strYoutube && (
              <a
                href={recipe.strYoutube}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
              >
                <PlayCircleIcon className='w-5 h-5 mr-2' />
                Watch on YouTube
              </a>
            )}
          </div>
        </div>

        <div className='md:col-span-2'>
          <div className='mb-8'>
            <h2 className='text-2xl font-semibold mb-3 border-b pb-2 text-gray-700'>
              Ingredients
            </h2>

            {recipe.extendedIngredients &&
            recipe.extendedIngredients.length > 0 ? (
              <ul className='list-none space-y-2 pl-1'>
                {recipe.extendedIngredients.map(ing => (
                  <li key={ing.id} className='flex items-start'>
                    <CheckCircleIcon className='w-5 h-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5' />

                    <span>{ing.original}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-gray-500 italic'>
                No ingredient details available.
              </p>
            )}
          </div>

          <div>
            <h2 className='text-2xl font-semibold mb-3 border-b pb-2 text-gray-700'>
              Instructions
            </h2>
            {recipe.strInstructions ? (
              <div
                className='prose prose-sm sm:prose-base max-w-none space-y-4 text-gray-700'
                dangerouslySetInnerHTML={{
                  __html: formatInstructions(recipe.strInstructions)
                }}
              />
            ) : (
              <p className='text-gray-500 italic'>Instructions not provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail