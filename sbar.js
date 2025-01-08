document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');
    const errorMessage = document.getElementById('errorMessage');
    let searchTimeout;

    // Search input handler with debouncing
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
    });

    // Form submit handler
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    async function performSearch(query) {
        try {
            showLoading(true);
            // Format the query as a proper ingredient
            const formattedQuery = query.match(/^\d+/) ? query : `1 whole ${query}`;
            
            const recipeData = {
                title: "Food Analysis",
                ingr: [formattedQuery]
            };
            
            console.log('Analyzing recipe:', recipeData);
            const results = await FoodService.analyzeRecipe(recipeData);
            displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'An error occurred while searching. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    function displayResults(nutrition) {
        searchResults.innerHTML = '';
        noResults.classList.toggle('d-none', nutrition !== null);

        if (!nutrition) {
            return;
        }

        searchResults.innerHTML = `
            <div class="food-item card mb-4">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Nutrition Analysis Results</h3>
                </div>
                <div class="card-body">
                    <!-- Basic Information -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="h6 mb-0">Basic Information</h4>
                            </div>
                            <div class="nutrition-overview">
                                <div class="badge bg-primary p-2 mb-2 d-block text-start">
                                    <i class="fas fa-fire me-2"></i>Calories: ${Math.round(nutrition.calories)} kcal
                                </div>
                                <div class="badge bg-success p-2 mb-2 d-block text-start">
                                    <i class="fas fa-weight me-2"></i>Total Weight: ${Math.round(nutrition.totalWeight)}g
                                </div>
                                <div class="badge bg-info p-2 mb-2 d-block text-start">
                                    <i class="fas fa-utensils me-2"></i>Servings: ${nutrition.yield}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Labels -->
                        <div class="col-md-6">
                            ${nutrition.dietLabels.length > 0 ? `
                                <div class="mb-3">
                                    <h4 class="h6 mb-2">Diet Labels</h4>
                                    <div>
                                        ${nutrition.dietLabels.map(label => 
                                            `<span class="badge bg-success me-2 mb-2">${label}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${nutrition.healthLabels.length > 0 ? `
                                <div class="mb-3">
                                    <h4 class="h6 mb-2">Health Labels</h4>
                                    <div>
                                        ${nutrition.healthLabels.map(label => 
                                            `<span class="badge bg-info me-2 mb-2">${label}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Detailed Nutrients -->
                    <div class="nutrients-section">
                        <h4 class="h6 mb-3">Detailed Nutrients</h4>
                        <div class="row">
                            ${Object.entries(nutrition.nutrients).map(([key, value]) => `
                                <div class="col-md-4 mb-2">
                                    <div class="nutrient-item p-2">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="nutrient-label">${value.label}</span>
                                            <span class="nutrient-value">
                                                ${Math.round(value.quantity)}${value.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Environmental Impact -->
                    ${nutrition.co2EmissionsClass ? `
                        <div class="environmental-impact mt-4">
                            <h4 class="h6 mb-3">Environmental Impact</h4>
                            <div class="eco-badge">
                                <span class="badge bg-${getCO2ClassColor(nutrition.co2EmissionsClass)} p-2">
                                    <i class="fas fa-leaf me-2"></i>
                                    CO2 Emissions Class: ${nutrition.co2EmissionsClass}
                                </span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Cautions -->
                    ${nutrition.cautions.length > 0 ? `
                        <div class="cautions-section mt-4">
                            <h4 class="h6 mb-3">Cautions</h4>
                            <div>
                                ${nutrition.cautions.map(caution => 
                                    `<span class="badge bg-warning text-dark me-2 mb-2">
                                        <i class="fas fa-exclamation-triangle me-1"></i>${caution}
                                    </span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function getCO2ClassColor(co2Class) {
        const colors = {
            'A+': 'success',
            'A': 'success',
            'B': 'info',
            'C': 'warning',
            'D': 'warning',
            'E': 'danger'
        };
        return colors[co2Class] || 'secondary';
    }

    function showLoading(show) {
        loading.classList.toggle('d-none', !show);
        if (show) {
            searchResults.innerHTML = '';
            noResults.classList.add('d-none');
            errorMessage.classList.add('d-none');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        searchResults.innerHTML = '';
        noResults.classList.add('d-none');
    }
});

// Add enhanced CSS styles
const style = document.createElement('style');
style.textContent = `
    .food-item {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: box-shadow 0.3s ease;
    }

    .food-item:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .nutrition-overview .badge {
        font-size: 0.9rem;
        width: 100%;
    }

    .nutrient-item {
        background-color: #f8f9fa;
        border-radius: 6px;
        transition: background-color 0.3s ease;
    }

    .nutrient-item:hover {
        background-color: #e9ecef;
    }

    .nutrient-label {
        font-weight: 500;
        color: #495057;
        font-size: 0.9rem;
    }

    .nutrient-value {
        color: #6c757d;
        font-size: 0.9rem;
    }

    .eco-badge .badge {
        font-size: 0.9rem;
    }

    .cautions-section .badge {
        font-size: 0.9rem;
    }

    #errorMessage {
        margin-bottom: 1rem;
    }

    #loading {
        padding: 2rem;
    }
`;
document.head.appendChild(style);