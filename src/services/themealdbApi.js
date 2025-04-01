import axios from 'axios';

const API_KEY = '1';
const BASE_URL = `https://www.themealdb.com/api/json/v1/${API_KEY}`;

const handleApiError = (error, context) => {
    console.error(`TheMealDB API Error (${context}):`, error);
    let message = 'An unexpected error occurred.';
    if (error.response) {
        message = `Request failed with status ${error.response.status}`;
        console.error("Error data:", error.response.data);
    } else if (error.request) {
        message = 'Network Error: Could not reach TheMealDB API.';
    } else {
        message = error.message || 'Error setting up the request.';
    }
    return { error: true, message, data: null };
};

const parseIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (!ingredient || ingredient.trim() === '') {
            break;
        }
        ingredients.push({
            id: `${meal.idMeal}-ing-${i}`,
            original: `${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim(),
            name: ingredient.trim(),
            measure: measure ? measure.trim() : '',
            image: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient.trim())}-Small.png`,
            aisle: null,
        });
    }
    return ingredients;
};


export const searchMealsByName = async (query) => {
    if (!query) return { data: null };
    try {
        const response = await axios.get(`${BASE_URL}/search.php`, { params: { s: query } });
        return { data: response.data.meals || [] };
    } catch (error) {
        return handleApiError(error, `searchMealsByName (query: ${query})`);
    }
};

export const filterMealsByIngredient = async (ingredient) => {
     if (!ingredient) return { data: null };
     try {
         const mainIngredient = ingredient.split(',')[0].trim();
         const response = await axios.get(`${BASE_URL}/filter.php`, { params: { i: mainIngredient } });
         return { data: response.data.meals || [] };
     } catch (error) {
         return handleApiError(error, `filterMealsByIngredient (ingredient: ${ingredient})`);
     }
 };

export const getMealDetailsById = async (id) => {
    if (!id) return { data: null };
    try {
        const response = await axios.get(`${BASE_URL}/lookup.php`, { params: { i: id } });
        if (response.data.meals && response.data.meals.length > 0) {
            const meal = response.data.meals[0];
            const ingredients = parseIngredients(meal);
            return { data: { ...meal, extendedIngredients: ingredients }};
        } else {
            return { data: null };
        }
    } catch (error) {
        return handleApiError(error, `getMealDetailsById (ID: ${id})`);
    }
};

export const getRandomMeal = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/random.php`);
        if (response.data.meals && response.data.meals.length > 0) {
             const meal = response.data.meals[0];
             const ingredients = parseIngredients(meal);
             return { data: { ...meal, extendedIngredients: ingredients } };
        } else {
            return { data: null };
        }
    } catch (error) {
        return handleApiError(error, 'getRandomMeal');
    }
};

