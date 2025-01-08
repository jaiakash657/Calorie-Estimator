// foodService.js
class FoodService {
    static async analyzeRecipe(recipeData) {
        try {
            // Format ingredients properly
            const requestBody = {
                title: recipeData.title || 'Recipe Analysis',
                ingr: recipeData.ingr.map(ingredient => {
                    // Ensure ingredient is properly formatted (quantity + unit + food)
                    if (!ingredient.includes(' ')) {
                        return `1 whole ${ingredient}`;
                    }
                    return ingredient;
                })
            };

            console.log('Sending request with body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`https://api.edamam.com/api/nutrition-details?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                if (response.status === 555) {
                    throw new Error('Recipe could not be analyzed. Please check the ingredient format.');
                }
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return this.processNutritionData(data);
        } catch (error) {
            console.error('Error analyzing recipe:', error);
            throw error;
        }
    }

    static processNutritionData(data) {
        return {
            recipeName: data.label || 'Recipe Analysis',
            yield: data.yield || 1,
            calories: data.calories || 0,
            totalWeight: data.totalWeight || 0,
            dietLabels: data.dietLabels || [],
            healthLabels: data.healthLabels || [],
            cautions: data.cautions || [],
            nutrients: this.processNutrients(data.totalNutrients || {}),
            dailyValues: this.processNutrients(data.totalDaily || {}),
            ingredients: data.ingredientLines || [],
            cuisineType: data.cuisineType || [],
            mealType: data.mealType || [],
            dishType: data.dishType || [],
            glycemicIndex: data.glycemicIndex,
            co2EmissionsClass: data.co2EmissionsClass
        };
    }

    static processNutrients(nutrientsData) {
        const processed = {};
        
        for (const [key, value] of Object.entries(nutrientsData)) {
            if (value && typeof value === 'object') {
                processed[key] = {
                    label: value.label || key,
                    quantity: value.quantity || 0,
                    unit: value.unit || 'g'
                };
            }
        }
        
        return processed;
    }
}