// KRISHI-MITRA - Analytics Module

class AnalyticsManager {
    constructor() {
        this.currentAnalysis = null;
        this.cropDatabase = {
            'ragi': {
                name_english: 'Finger Millet',
                name_kannada: 'ರಾಗಿ',
                image: '🌾',
                varieties: ['GPU-28', 'MR-1', 'MR-6'],
                ideal_conditions: {
                    ph: [5.5, 7.0],
                    nitrogen: [150, 300],
                    phosphorus: [30, 50],
                    potassium: [20, 40]
                },
                economics: {
                    input_cost_per_acre: 15000,
                    expected_revenue_per_acre: 35000,
                    expected_yield: '25-30 quintals/hectare'
                },
                timeline: {
                    sowing: 'June-July',
                    flowering: 'August',
                    harvest: 'October-November',
                    duration: '120-130 days'
                },
                best_variety: 'GPU-28'
            },
            'maize': {
                name_english: 'Maize',
                name_kannada: 'ಮೆಕ್ಕೆಜೋಳ',
                image: '🌽',
                varieties: ['DHM 117', 'DHM 121', 'NK 6240'],
                ideal_conditions: {
                    ph: [6.0, 7.5],
                    nitrogen: [180, 300],
                    phosphorus: [25, 50],
                    potassium: [150, 250]
                },
                economics: {
                    input_cost_per_acre: 20000,
                    expected_revenue_per_acre: 45000,
                    expected_yield: '40-50 quintals/hectare'
                },
                timeline: {
                    sowing: 'June',
                    flowering: 'August',
                    harvest: 'September-October',
                    duration: '110-120 days'
                },
                best_variety: 'DHM 117'
            },
            'wheat': {
                name_english: 'Wheat',
                name_kannada: 'ಗೋಧಿ',
                image: '🌾',
                varieties: ['HI 1544', 'HD 3086', 'PBW 343'],
                ideal_conditions: {
                    ph: [6.5, 7.5],
                    nitrogen: [200, 300],
                    phosphorus: [30, 60],
                    potassium: [150, 250]
                },
                economics: {
                    input_cost_per_acre: 18000,
                    expected_revenue_per_acre: 40000,
                    expected_yield: '35-45 quintals/hectare'
                },
                timeline: {
                    sowing: 'November',
                    flowering: 'February',
                    harvest: 'March-April',
                    duration: '120-130 days'
                },
                best_variety: 'HI 1544'
            }
        };
    }

    // Load analysis results from session storage
    loadAnalysisResults() {
        const results = sessionStorage.getItem('analysisResults');
        if (results) {
            this.currentAnalysis = JSON.parse(results);
            return this.currentAnalysis;
        }
        return null;
    }

    // Render soil health score
    renderSoilScore(score) {
        const scoreCircle = document.getElementById('scoreCircle');
        const scoreValue = document.getElementById('scoreValue');
        
        if (!scoreCircle || !scoreValue) return;

        // Animate score counting
        this.animateScoreCount(scoreValue, score);
        
        // Update circle color based on score
        scoreCircle.className = this.getScoreClass(score);
    }

    // Animate score counting
    animateScoreCount(element, targetScore) {
        let currentScore = 0;
        const increment = Math.ceil(targetScore / 50);
        const interval = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(interval);
            }
            element.textContent = currentScore;
        }, 50);
    }

    // Get score CSS class based on value
    getScoreClass(score) {
        if (score >= 81) return 'score-circle excellent';
        if (score >= 61) return 'score-circle good';
        if (score >= 41) return 'score-circle fair';
        return 'score-circle poor';
    }

    // Render crop recommendations
    renderCropRecommendations(recommendations) {
        const cropsGrid = document.getElementById('cropsGrid');
        if (!cropsGrid) return;

        cropsGrid.innerHTML = recommendations.map(crop => {
            const cropData = this.cropDatabase[crop.crop] || this.getDefaultCropData(crop.crop);
            return this.createCropCard(crop, cropData);
        }).join('');
    }

    // Create crop card HTML
    createCropCard(crop, cropData) {
        const successRate = Math.round(crop.confidence);
        const profitPotential = cropData.economics.expected_revenue_per_acre - cropData.economics.input_cost_per_acre;
        
        return `
            <div class="crop-card" onclick="analytics.showCropDetails('${crop.crop}')">
                <div class="crop-card-header">
                    <div class="crop-name">${cropData.name_english} (${cropData.name_kannada})</div>
                    <div class="success-rate">${successRate}% Match</div>
                </div>
                <div class="crop-image">
                    <img src="../../assets/images/crops/${crop.crop}.svg" alt="${cropData.name_english}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4rem;">${cropData.image}</div>
                </div>
                <p class="crop-info">${this.getCropDescription(crop.crop)}</p>
                <div class="crop-tags">
                    <span class="tag">${cropData.timeline.sowing}</span>
                    <span class="tag">${cropData.economics.expected_yield}</span>
                    <span class="tag">₹${profitPotential.toLocaleString()}/acre profit</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn action-btn-primary" onclick="event.stopPropagation(); analytics.showCropDetails('${crop.crop}')">
                        <i class="fas fa-info-circle"></i> Learn More
                    </button>
                    <button class="action-btn action-btn-secondary" onclick="event.stopPropagation(); analytics.saveCropRecommendation('${crop.crop}')">
                        <i class="fas fa-bookmark"></i> Save
                    </button>
                </div>
            </div>
        `;
    }

    // Get crop description
    getCropDescription(cropType) {
        const descriptions = {
            'ragi': 'Ideal for Mysuru region. Drought-resistant crop with high nutritional value. Perfect for rainfed agriculture.',
            'maize': 'High-yielding crop suitable for most soil types. Requires good irrigation and proper pest management.',
            'wheat': 'Winter crop with good market demand. Requires moderate irrigation and well-drained soil.',
            'rice': 'Staple crop with high water requirement. Suitable for areas with good irrigation facilities.',
            'cotton': 'Cash crop with high market value. Requires careful pest management and good drainage.'
        };
        return descriptions[cropType] || 'Suitable crop for your soil conditions.';
    }

    // Get default crop data for unknown crops
    getDefaultCropData(cropType) {
        return {
            name_english: cropType.charAt(0).toUpperCase() + cropType.slice(1),
            name_kannada: cropType,
            image: '🌱',
            varieties: ['Local Variety'],
            ideal_conditions: {
                ph: [6.0, 7.0],
                nitrogen: [200, 300],
                phosphorus: [30, 50],
                potassium: [150, 250]
            },
            economics: {
                input_cost_per_acre: 15000,
                expected_revenue_per_acre: 30000,
                expected_yield: '20-30 quintals/hectare'
            },
            timeline: {
                sowing: 'June-July',
                flowering: 'August',
                harvest: 'October-November',
                duration: '120-130 days'
            },
            best_variety: 'Local Variety'
        };
    }

    // Render fertilizer recommendations
    renderFertilizerPlan(fertilizerPlan) {
        const fertilizerSection = document.querySelector('.fertilizer-section');
        if (!fertilizerSection || !fertilizerPlan) return;

        const planHTML = `
            <div class="fertilizer-card">
                <h4>Suggested Fertilizer Application</h4>
                ${fertilizerPlan.stages.map(stage => `
                    <div class="fertilizer-stage">
                        <h5>${stage.stage}</h5>
                        ${stage.fertilizers.map(fertilizer => `
                            <div class="fertilizer-item">
                                <span class="fertilizer-name">${fertilizer.name}</span>
                                <span class="fertilizer-amount">${fertilizer.amount}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <div class="total-cost">
                    <strong>Total Estimated Cost: ${fertilizerPlan.total_cost}</strong>
                </div>
            </div>
        `;

        const existingCard = fertilizerSection.querySelector('.fertilizer-card');
        if (existingCard) {
            existingCard.outerHTML = planHTML;
        } else {
            fertilizerSection.innerHTML += planHTML;
        }
    }

    // Render crop lifecycle timeline
    renderCropTimeline(cropType) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;

        const cropData = this.cropDatabase[cropType] || this.getDefaultCropData(cropType);
        const timelineData = this.generateTimelineData(cropData);

        timeline.innerHTML = timelineData.map((item, index) => `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="timeline-content">
                    <h4>Week ${index + 1}: ${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // Generate timeline data for crop
    generateTimelineData(cropData) {
        const baseTimeline = [
            { icon: 'fa-seed', title: 'Seed Preparation', desc: 'Select quality seeds and prepare nursery beds' },
            { icon: 'fa-seedling', title: 'Sowing', desc: `Sow seeds during ${cropData.timeline.sowing}` },
            { icon: 'fa-tshirt', title: 'Fertilization', desc: 'Apply recommended fertilizers' },
            { icon: 'fa-tint', title: 'Irrigation', desc: 'Ensure adequate water supply' },
            { icon: 'fa-leaf', title: 'Pest Management', desc: 'Monitor and control pests' },
            { icon: 'fa-harvest', title: 'Harvesting', desc: `Harvest during ${cropData.timeline.harvest}` }
        ];

        return baseTimeline;
    }

    // Show detailed crop information
    showCropDetails(cropType) {
        const cropData = this.cropDatabase[cropType] || this.getDefaultCropData(cropType);
        
        const detailsHTML = `
            <div class="crop-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${cropData.name_english} (${cropData.name_kannada})</h2>
                        <button onclick="this.closest('.crop-details-modal').remove()" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="crop-info-grid">
                            <div class="info-section">
                                <h3>Growing Information</h3>
                                <p><strong>Sowing:</strong> ${cropData.timeline.sowing}</p>
                                <p><strong>Harvest:</strong> ${cropData.timeline.harvest}</p>
                                <p><strong>Duration:</strong> ${cropData.timeline.duration}</p>
                                <p><strong>Best Variety:</strong> ${cropData.best_variety}</p>
                            </div>
                            <div class="info-section">
                                <h3>Economics</h3>
                                <p><strong>Input Cost:</strong> ₹${cropData.economics.input_cost_per_acre.toLocaleString()}/acre</p>
                                <p><strong>Expected Revenue:</strong> ₹${cropData.economics.expected_revenue_per_acre.toLocaleString()}/acre</p>
                                <p><strong>Expected Yield:</strong> ${cropData.economics.expected_yield}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    }

    // Save crop recommendation
    saveCropRecommendation(cropType) {
        const savedCrops = JSON.parse(localStorage.getItem('savedCrops') || '[]');
        if (!savedCrops.includes(cropType)) {
            savedCrops.push(cropType);
            localStorage.setItem('savedCrops', JSON.stringify(savedCrops));
            
            // Show success message
            this.showToast(`${this.cropDatabase[cropType]?.name_english || cropType} saved to your recommendations!`);
        } else {
            this.showToast('Crop already saved!');
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-message">${message}</div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize analytics page
    init() {
        const analysis = this.loadAnalysisResults();
        if (!analysis) {
            console.warn('No analysis results found');
            return;
        }

        this.currentAnalysis = analysis;

        // Render all components
        this.renderSoilScore(analysis.soil_score);
        this.renderCropRecommendations(analysis.recommendations || []);
        
        if (analysis.fertilizer_plan) {
            this.renderFertilizerPlan(analysis.fertilizer_plan);
        }

        // Render timeline for first recommended crop
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            this.renderCropTimeline(analysis.recommendations[0].crop);
        }

        // Add CSS for modal if not exists
        this.addModalStyles();
    }

    // Add modal styles
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .crop-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #666;
            }
            .modal-body {
                padding: 20px;
            }
            .crop-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }
            .info-section h3 {
                color: #416422;
                margin-bottom: 15px;
            }
            .info-section p {
                margin-bottom: 10px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }
}

// Create global instance
const analytics = new AnalyticsManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    analytics.init();
});
