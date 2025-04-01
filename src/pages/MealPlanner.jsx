import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useData } from '../hooks/useData'
import {
  TrashIcon as TrashOutlineIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { TrashIcon as TrashSolidIcon } from '@heroicons/react/24/solid'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]
const mealTimes = ['breakfast', 'lunch', 'dinner']

const DraggableRecipe = ({ id, recipe, context = 'sidebar', onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  if (!recipe) {
    return null
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && context !== 'overlay' ? 0.5 : 1,

    zIndex: isDragging ? 100 : 'auto'
  }

  const baseClasses = 'rounded border flex items-center relative group'
  let contextClasses = ''
  let textClasses = ''
  let showRemoveButton = false
  let showDragHandle = true

  if (context === 'sidebar') {
    contextClasses =
      'p-2 pl-1 text-sm justify-between mb-2 bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:shadow-sm'
    textClasses = 'truncate flex-1 mx-2'
    showRemoveButton = true
  } else if (context === 'planner') {
    contextClasses =
      'p-1 pl-0.5 text-xs justify-start h-full bg-emerald-50 border-emerald-200 text-emerald-800 overflow-hidden hover:bg-emerald-100'
    textClasses = 'truncate flex-1 mx-1 leading-tight min-w-0'
  } else if (context === 'overlay') {
    contextClasses =
      'p-2 text-sm truncate justify-between bg-white shadow-xl border-gray-300'
    textClasses = 'truncate flex-1 mx-2'
    showDragHandle = false
  }

  const handleRemoveClick = e => {
    e.stopPropagation()
    if (onRemove && recipe?.id) {
      onRemove(recipe.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${baseClasses} ${contextClasses}`}
      title={recipe.title || ''}
      {...attributes}
    >
      {showDragHandle && (
        <button
          type='button'
          className='p-1 text-gray-400 hover:text-gray-600 cursor-grab touch-none focus:outline-none flex-shrink-0'
          {...listeners}
        >
          <Bars3Icon className='w-4 h-4' />
        </button>
      )}

      <span className={textClasses}>{recipe.title || 'Untitled Recipe'}</span>

      {showRemoveButton && onRemove && recipe?.id && (
        <button
          type='button'
          onClick={handleRemoveClick}
          className='p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-red-500 z-20 ml-auto'
          title={`Remove ${recipe.title || 'recipe'} from saved`}
        >
          <TrashSolidIcon className='w-4 h-4' />
        </button>
      )}
    </div>
  )
}

const MealSlot = ({ id, day, meal, recipe, onRemove }) => {
  const { setNodeRef, isOver } = useSortable({ id: id })

  const style = {
    border: isOver ? '2px dashed #10b981' : '1px dashed #d1d5db',
    backgroundColor: isOver ? '#ecfdf5' : '#f9fafb',
    minHeight: '50px'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='p-1 rounded border-dashed flex flex-col justify-center items-center transition-colors duration-150 overflow-hidden'
    >
      {recipe && recipe.uniqueId ? (
        <div className='w-full h-full relative group'>
          <SortableContext
            items={[recipe.uniqueId]}
            strategy={rectSortingStrategy}
          >
            <DraggableRecipe
              id={recipe.uniqueId}
              recipe={recipe}
              context='planner'
            />
          </SortableContext>
          {recipe.title && (
            <button
              onClick={() => onRemove(day, meal)}
              className='absolute -top-0.5 -right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100 focus:ring-1 focus:ring-red-700 focus:outline-none z-10'
              title={`Remove ${recipe.title}`}
            >
              <TrashOutlineIcon className='w-3 h-3' />
            </button>
          )}
        </div>
      ) : (
        <span className='text-xs text-gray-400 italic'>Empty</span>
      )}
    </div>
  )
}

function MealPlanner () {
  const {
    savedRecipes,
    mealPlan,
    updateMealPlan,
    clearMealPlan,
    loadingData,
    removeSavedRecipe
  } = useData()
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {}, [savedRecipes, mealPlan])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor)
  )

  const plannerItems = {}
  let plannerRecipeCount = 0
  Object.entries(mealPlan || {}).forEach(([day, meals]) => {
    plannerItems[day] = {}
    Object.entries(meals || {}).forEach(([meal, recipe]) => {
      const slotId = `${day}-${meal}`
      if (recipe && typeof recipe.id !== 'undefined') {
        const uniqueId =
          recipe.uniqueId || `planner-${recipe.id}-${plannerRecipeCount++}`
        plannerItems[day][meal] = {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          uniqueId,
          slotId
        }
      } else {
        plannerItems[day][meal] = null
      }
    })
  })
  useEffect(() => {}, [mealPlan])

  const sidebarRecipeIds = Array.isArray(savedRecipes)
    ? savedRecipes
        .map(r => (r && r.id ? `sidebar-${r.id}` : null))
        .filter(Boolean)
    : []

  const findContainer = id => {
    if (!id) return null
    const stringId = id.toString()
    if (stringId.startsWith('sidebar-')) return 'savedRecipes'
    for (const day of daysOfWeek) {
      for (const meal of mealTimes) {
        const slotId = `${day}-${meal}`
        if (
          stringId === slotId ||
          plannerItems[day]?.[meal]?.uniqueId === stringId
        ) {
          return slotId
        }
      }
    }
    return null
  }

  const handleDragStart = event => {
    setActiveId(event.active.id)
  }

  const handleDragOver = _event => {}

  const handleDragEnd = event => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !over.id || active.id === over.id) {
      return
    }
    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)

    if (!activeContainer || !overContainer) {
      return
    }
    if (
      activeContainer === 'savedRecipes' &&
      overContainer === 'savedRecipes'
    ) {
      return
    }

    const activeIsSidebar = activeContainer === 'savedRecipes'
    const overIsSidebar = overContainer === 'savedRecipes'
    const activeIsPlanner = !activeIsSidebar
    const overIsPlanner = !overIsSidebar

    let draggedRecipeData = null

    if (activeIsSidebar) {
      const idPart = active.id.toString().replace('sidebar-', '')
      draggedRecipeData = Array.isArray(savedRecipes)
        ? savedRecipes.find(r => r && r.id?.toString() === idPart)
        : null
    } else if (activeIsPlanner) {
      for (const dayMeals of Object.values(plannerItems)) {
        const found = Object.values(dayMeals).find(
          item => item?.uniqueId === active.id
        )
        if (found) {
          draggedRecipeData = {
            id: found.id,
            title: found.title,
            image: found.image
          }
          break
        }
      }
    }

    if (!draggedRecipeData || typeof draggedRecipeData.id === 'undefined') {
      return
    }

    const newPlan = JSON.parse(JSON.stringify(mealPlan))
    let originalSlotDay = null
    let originalSlotMeal = null

    if (activeIsPlanner && activeContainer !== 'savedRecipes') {
      ;[originalSlotDay, originalSlotMeal] = activeContainer.split('-')
    }

    if (activeIsSidebar && overIsPlanner) {
      const [targetDay, targetMeal] = overContainer.split('-')
      newPlan[targetDay][targetMeal] = { ...draggedRecipeData }
    } else if (activeIsPlanner && overIsSidebar) {
      if (originalSlotDay && originalSlotMeal) {
        newPlan[originalSlotDay][originalSlotMeal] = null
      }
    } else if (
      activeIsPlanner &&
      overIsPlanner &&
      activeContainer !== overContainer
    ) {
      const [targetDay, targetMeal] = overContainer.split('-')
      if (originalSlotDay && originalSlotMeal) {
        const recipeAtTarget = newPlan[targetDay][targetMeal]
        newPlan[targetDay][targetMeal] = { ...draggedRecipeData }
        newPlan[originalSlotDay][originalSlotMeal] = recipeAtTarget
      }
    }

    if (JSON.stringify(newPlan) !== JSON.stringify(mealPlan)) {
      updateMealPlan(newPlan)
    }
  }

  const removeRecipeFromSlot = (day, meal) => {
    const newPlan = JSON.parse(JSON.stringify(mealPlan))
    if (newPlan[day]?.[meal]) {
      newPlan[day][meal] = null
      updateMealPlan(newPlan)
    }
  }

  const activeRecipeForOverlay = activeId
    ? activeId.toString().startsWith('sidebar-')
      ? Array.isArray(savedRecipes)
        ? savedRecipes.find(r => r && `sidebar-${r.id}` === activeId.toString())
        : null
      : Object.values(plannerItems)
          .flatMap(dayMeals => Object.values(dayMeals))
          .find(item => item?.uniqueId === activeId.toString())
    : null

  useEffect(() => {}, [activeId, activeRecipeForOverlay])

  if (loadingData) return <LoadingSpinner message='Loading planner data...' />

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className='flex flex-col lg:flex-row gap-6 md:gap-8'>
        <div className='w-full lg:w-64 xl:w-72 flex-shrink-0 bg-white p-4 rounded-lg shadow border border-gray-200'>
          <h2 className='text-xl font-semibold mb-4 text-gray-700 border-b pb-2'>
            Your Saved Recipes
          </h2>
          {!Array.isArray(savedRecipes) || savedRecipes.length === 0 ? (
            <div className='text-center py-6'>
              <p className='text-sm text-gray-500 mb-3'>
                You haven't saved any recipes yet.
              </p>
              <Link to='/search'>
                <Button variant='primary' size='sm'>
                  Find Recipes
                </Button>
              </Link>
            </div>
          ) : (
            <SortableContext
              items={sidebarRecipeIds}
              strategy={verticalListSortingStrategy}
            >
              <div className='max-h-[60vh] overflow-y-auto pr-1'>
                {savedRecipes.map(recipe =>
                  recipe && recipe.id ? (
                    <DraggableRecipe
                      key={`sidebar-${recipe.id}`}
                      id={`sidebar-${recipe.id}`}
                      recipe={recipe}
                      context='sidebar'
                      onRemove={removeSavedRecipe}
                    />
                  ) : null
                )}
              </div>
            </SortableContext>
          )}
        </div>

        <div className='flex-grow bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200'>
          <div className='flex justify-between items-center mb-4 border-b pb-3'>
            <h1 className='text-2xl font-bold text-gray-800 flex items-center'>
              <CalendarDaysIcon className='w-6 h-6 mr-2 text-primary' /> Weekly
              Meal Plan
            </h1>
            <div className='flex gap-2'>
              <Button
                onClick={clearMealPlan}
                variant='danger'
                size='sm'
                title='Clear entire plan'
              >
                <ArrowPathIcon className='w-4 h-4 mr-1' /> Clear Plan
              </Button>
              <Link to='/grocery-list'>
                <Button variant='secondary' size='sm'>
                  View Grocery List
                </Button>
              </Link>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-[auto_repeat(3,minmax(0,1fr))] lg:grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-1 md:gap-2 text-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider'>
            <div className='hidden md:block'></div>
            {daysOfWeek.map(day => (
              <div key={day} className='py-2 hidden lg:block capitalize'>
                {day}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-[auto_repeat(3,minmax(0,1fr))] lg:grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-2 md:gap-3'>
            <div className='grid-rows-3 gap-2 md:gap-3 hidden md:grid'>
              {mealTimes.map(meal => (
                <div
                  key={meal}
                  className='h-full flex items-center justify-center text-xs font-semibold text-gray-500 uppercase bg-gray-50 rounded p-1 capitalize'
                >
                  {meal}
                </div>
              ))}
            </div>

            {daysOfWeek.map(day => (
              <div
                key={`${day}-col`}
                className='grid grid-rows-3 gap-2 md:gap-3'
              >
                <div className='py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider lg:hidden capitalize'>
                  {day}
                </div>

                {mealTimes.map(meal => {
                  const slotId = `${day}-${meal}`
                  const recipeInSlot = plannerItems[day]?.[meal]
                  return (
                    <SortableContext
                      key={slotId}
                      items={recipeInSlot ? [recipeInSlot.uniqueId] : []}
                      strategy={rectSortingStrategy}
                    >
                      <MealSlot
                        id={slotId}
                        day={day}
                        meal={meal}
                        recipe={recipeInSlot}
                        onRemove={removeRecipeFromSlot}
                      />
                    </SortableContext>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeRecipeForOverlay ? (
          <DraggableRecipe
            id={activeId}
            recipe={activeRecipeForOverlay}
            context='overlay'
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default MealPlanner