import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'
import { useAuth } from '../hooks/useAuth'

import { getMealDetailsById } from '../services/themealdbApi'

export const DataContext = createContext(null)

const createInitialMealPlan = () => ({
  monday: { breakfast: null, lunch: null, dinner: null },
  tuesday: { breakfast: null, lunch: null, dinner: null },
  wednesday: { breakfast: null, lunch: null, dinner: null },
  thursday: { breakfast: null, lunch: null, dinner: null },
  friday: { breakfast: null, lunch: null, dinner: null },
  saturday: { breakfast: null, lunch: null, dinner: null },
  sunday: { breakfast: null, lunch: null, dinner: null }
})

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [mealPlan, setMealPlan] = useState(() => createInitialMealPlan())
  const [groceryList, setGroceryList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const isInitialLoadDone = useRef(false)

  useEffect(() => {
    if (user?.id) {
      setLoadingData(true)
      isInitialLoadDone.current = false
      try {
        const storageKey = `recipeAppData_${user.id}`
        const storedData = localStorage.getItem(storageKey)
        if (storedData) {
          const data = JSON.parse(storedData)
          setSavedRecipes(
            Array.isArray(data.savedRecipes) ? data.savedRecipes : []
          )
          setMealPlan(
            data.mealPlan && typeof data.mealPlan === 'object'
              ? data.mealPlan
              : createInitialMealPlan()
          )

          setGroceryList(
            Array.isArray(data.groceryList) ? data.groceryList : []
          )
        } else {
          setSavedRecipes([])
          setMealPlan(createInitialMealPlan())
          setGroceryList([])
        }
      } catch (error) {
        console.error(
          '[DataContext] Failed to load/parse user data from localStorage:',
          error
        )
        setSavedRecipes([])
        setMealPlan(createInitialMealPlan())
        setGroceryList([])
        localStorage.removeItem(`recipeAppData_${user.id}`)
      } finally {
        setLoadingData(false)
        isInitialLoadDone.current = true
      }
    } else {
      setSavedRecipes([])
      setMealPlan(createInitialMealPlan())
      setGroceryList([])
      setLoadingData(false)
      isInitialLoadDone.current = false
    }
  }, [user])

  useEffect(() => {
    if (user?.id && isInitialLoadDone.current && !loadingData) {
      try {
        const dataToSave = JSON.stringify({
          savedRecipes,
          mealPlan,
          groceryList
        })
        const storageKey = `recipeAppData_${user.id}`
        localStorage.setItem(storageKey, dataToSave)
      } catch (error) {
        console.error(
          '[DataContext] Failed to save user data to localStorage:',
          error
        )
      }
    }
  }, [savedRecipes, mealPlan, groceryList, user, loadingData])

  const addSavedRecipe = useCallback(recipe => {
    if (!recipe || typeof recipe.id === 'undefined' || !recipe.title) return
    setSavedRecipes(prev => {
      if (!prev.some(r => r.id === recipe.id)) {
        return [
          ...prev,
          { id: recipe.id, title: recipe.title, image: recipe.image }
        ]
      }
      return prev
    })
  }, [])

  const removeSavedRecipe = useCallback(recipeId => {
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId))
  }, [])

  const isRecipeSaved = useCallback(
    recipeId => {
      return savedRecipes.some(r => r.id === recipeId)
    },
    [savedRecipes]
  )

  const updateMealPlan = useCallback(newPlan => {
    setMealPlan(newPlan)
  }, [])

  const clearMealPlan = useCallback(() => {
    setMealPlan(createInitialMealPlan())
    setGroceryList([])
  }, [])

  const generateGroceryList = useCallback(async () => {
    console.log('[DataContext] generateGroceryList called (TheMealDB Logic)')
    setLoadingData(true)
    setError(null)
    setGroceryList([])

    const planEntries = []
    Object.entries(mealPlan).forEach(([day, meals]) => {
      Object.entries(meals).forEach(([meal, recipe]) => {
        if (recipe && typeof recipe.id !== 'undefined') {
          planEntries.push({ day, meal, recipe })
        }
      })
    })

    if (planEntries.length === 0) {
      console.log('[DataContext] No valid recipes in plan.')
      setLoadingData(false)
      return
    }

    const recipeDetailCache = new Map()
    const groceryListByRecipeInstance = []

    try {
      for (const entry of planEntries) {
        if (
          !entry.recipe ||
          typeof entry.recipe.id === 'undefined' ||
          typeof entry.recipe.title === 'undefined'
        ) {
          console.error(
            '[DataContext] Invalid recipe data in plan entry:',
            entry
          )
          continue
        }

        let detailsResult = recipeDetailCache.get(entry.recipe.id)
        let details = null
        let fetchErrorMsg = null

        if (!detailsResult) {
          console.log(
            `[DataContext] Fetching details for MealDB ID: ${entry.recipe.id}`
          )
          detailsResult = await getMealDetailsById(entry.recipe.id)
          recipeDetailCache.set(entry.recipe.id, detailsResult)
        } else {
          console.log(
            `[DataContext] Using cached details for MealDB ID: ${entry.recipe.id}`
          )
        }

        if (detailsResult && !detailsResult.error && detailsResult.data) {
          details = detailsResult.data
        } else {
          console.warn(
            `[DataContext] Failed to get details for MealDB ID: ${entry.recipe.id}. Error: ${detailsResult?.message}`
          )
          fetchErrorMsg = detailsResult?.message || 'Failed to fetch details'
        }

        groceryListByRecipeInstance.push({
          day: entry.day,
          meal: entry.meal,
          recipe: {
            id: entry.recipe.id,
            title: entry.recipe.title
          },

          ingredients: details?.extendedIngredients || [],
          fetchError: fetchErrorMsg
        })
      }

      setGroceryList(groceryListByRecipeInstance)
      console.log(
        '[DataContext] MealDB structured grocery list generated:',
        groceryListByRecipeInstance
      )
    } catch (error) {
      console.error(
        '[DataContext] Unexpected error during MealDB grocery list generation:',
        error
      )
      setError(
        'An unexpected error occurred while generating the grocery list.'
      )
      setGroceryList([])
    } finally {
      setLoadingData(false)
    }
  }, [mealPlan])

  const value = {
    savedRecipes,
    addSavedRecipe,
    removeSavedRecipe,
    isRecipeSaved,
    mealPlan,
    updateMealPlan,
    clearMealPlan,
    groceryList,
    generateGroceryList,
    loadingData,
    error,
    setError
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
