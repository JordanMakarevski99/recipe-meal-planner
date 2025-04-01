import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../hooks/useData'
import {
  BookmarkIcon as BookmarkOutlineIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import Button from './ui/Button'

function RecipeCard ({ recipe, source = 'search' }) {
  const { isAuthenticated } = useAuth()
  const { addSavedRecipe, removeSavedRecipe, isRecipeSaved } = useData()

  const imageUrl =
    recipe.image ||
    'https://via.placeholder.com/312x231/e2e8f0/64748b?text=No+Image'
  const saved = recipe?.id ? isRecipeSaved(recipe.id) : false

  const handleSaveToggle = e => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Please log in to save recipes.')
      return
    }
    if (!recipe || !recipe.id) return

    if (saved) {
      removeSavedRecipe(recipe.id)
    } else {
      addSavedRecipe({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image
      })
    }
  }

  const handleRemoveFromSaved = e => {
    e.preventDefault()
    e.stopPropagation()
    if (recipe?.id) {
      removeSavedRecipe(recipe.id)
    }
  }

  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col group border border-gray-200'>
      <Link to={`/recipe/${recipe.id}`} className='block relative'>
        <img
          src={imageUrl}
          alt={recipe.title || 'Recipe Image'}
          className='w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
          onError={e => {
            e.target.onerror = null
            e.target.src =
              'https://via.placeholder.com/312x231/e2e8f0/64748b?text=Load+Error'
          }}
        />
        {isAuthenticated && source !== 'saved' && recipe?.id && (
          <button
            onClick={handleSaveToggle}
            title={saved ? 'Remove from Saved' : 'Save Recipe'}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200 ${
              saved
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white/80 text-gray-700 hover:bg-white hover:text-emerald-500 backdrop-blur-sm'
            }`}
          >
            {saved ? (
              <BookmarkSolidIcon className='w-5 h-5' />
            ) : (
              <BookmarkOutlineIcon className='w-5 h-5' />
            )}
          </button>
        )}
      </Link>

      <div className='p-4 flex flex-col flex-grow'>
        <Link
          to={`/recipe/${recipe.id}`}
          className='block hover:text-primary transition-colors'
        >
          <h3
            className='font-semibold text-md mb-2 truncate group-hover:text-primary'
            title={recipe.title || 'Untitled Recipe'}
          >
            {recipe.title || 'Untitled Recipe'}
          </h3>
        </Link>


        <div className='mt-auto pt-2 flex justify-between items-center'>
          <Link
            to={`/recipe/${recipe.id}`}
            className='text-xs text-primary hover:underline font-medium'
          >
            View Details
          </Link>
          {source === 'saved' && isAuthenticated && recipe?.id && (
            <Button
              variant='danger'
              size='sm'
              onClick={handleRemoveFromSaved}
              title='Remove from saved'
              className='px-2 py-1'
            >
              <TrashIcon className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecipeCard
