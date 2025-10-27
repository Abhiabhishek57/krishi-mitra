// Main menu navigation
function showMainMenu() {
    document.querySelector('.menu-container').style.display = 'block';
    document.getElementById('locationForm').style.display = 'none';
    document.getElementById('questionsForm').style.display = 'none';
    document.getElementById('labDataForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
}

function showLocationForm() {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('locationForm').style.display = 'block';
    document.getElementById('questionsForm').style.display = 'none';
    document.getElementById('labDataForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
}

function showQuestionsForm() {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('locationForm').style.display = 'none';
    document.getElementById('questionsForm').style.display = 'block';
    document.getElementById('labDataForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
}

function showLabDataForm() {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('locationForm').style.display = 'none';
    document.getElementById('questionsForm').style.display = 'none';
    document.getElementById('labDataForm').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'none';
}

function showResults(results) {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('locationForm').style.display = 'none';
    document.getElementById('questionsForm').style.display = 'none';
    document.getElementById('labDataForm').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    
    displayResults(results);
}

// Display results
function displayResults(results) {
    const resultsContent = document.getElementById('resultsContent');
    
    let html = '';
    
    if (results.soil_score !== undefined) {
        // Lab data results
        html += `
            <div class="score-display">
                <div class="score-circle ${getScoreClass(results.soil_score)}">
                    ${results.soil_score}
                </div>
                <h3>Soil Health Score</h3>
            </div>
        `;
        
        if (results.recommendations && results.recommendations.length > 0) {
            html += `
                <div class="result-item">
                    <h4><i class="fas fa-seedling"></i> Recommended Crops</h4>
                    <p>${results.recommendations.join(', ')}</p>
                </div>
            `;
        }
    }
    
    if (results.location_advice) {
        // Location-based advice
        html += `
            <div class="result-item">
                <h4><i class="fas fa-map-marker-alt"></i> Location-Based Advice</h4>
                <p>${results.location_advice}</p>
            </div>
        `;
    }
    
    if (results.soil_advice) {
        // Soil assessment advice
        html += `
            <div class="result-item">
                <h4><i class="fas fa-leaf"></i> Soil Assessment Advice</h4>
                <p>${results.soil_advice}</p>
            </div>
        `;
    }
    
    if (results.crop_recommendations && results.crop_recommendations.length > 0) {
        html += `
            <div class="result-item">
                <h4><i class="fas fa-seedling"></i> Recommended Crops</h4>
                <p>${results.crop_recommendations.join(', ')}</p>
            </div>
        `;
    }
    
    if (results.tips && results.tips.length > 0) {
        html += `
            <div class="result-item">
                <h4><i class="fas fa-lightbulb"></i> Farming Tips</h4>
                <ul>
                    ${results.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
}

function getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
}

// API calls
async function submitLocationData(formData) {
    try {
        const response = await fetch('/soil/location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const results = await response.json();
        showResults(results);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to get location advice. Please try again.');
    }
}

async function submitQuestionsData(formData) {
    try {
        const response = await fetch('/soil/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const results = await response.json();
        showResults(results);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to analyze soil data. Please try again.');
    }
}

async function submitLabData(formData) {
    try {
        const response = await fetch('/soil/manual', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const results = await response.json();
        showResults(results);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to analyze lab data. Please try again.');
    }
}

function showError(message) {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div class="message error">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
    `;
    showResults({});
}

function showLoading() {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading"></div>
            <p style="margin-top: 20px;">Analyzing your data...</p>
        </div>
    `;
    showResults({});
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Location form
    document.getElementById('locationFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            state: document.getElementById('state').value,
            district: document.getElementById('district').value,
            cropType: document.getElementById('cropType').value
        };
        
        submitLocationData(formData);
    });
    
    // Questions form
    document.getElementById('questionsFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            soilColor: document.getElementById('soilColor').value,
            soilTexture: document.getElementById('soilTexture').value,
            drainage: document.getElementById('drainage').value,
            moistureLevel: document.getElementById('moistureLevel').value,
            cropIntended: document.getElementById('cropIntended').value
        };
        
        submitQuestionsData(formData);
    });
    
    // Lab data form
    document.getElementById('labDataFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            N: parseFloat(document.getElementById('nitrogen').value),
            P: parseFloat(document.getElementById('phosphorus').value),
            K: parseFloat(document.getElementById('potassium').value),
            pH: parseFloat(document.getElementById('ph').value),
            moisture: parseFloat(document.getElementById('moisture').value)
        };
        
        submitLabData(formData);
    });
});

