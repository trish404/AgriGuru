// AgriGuru Dashboard JavaScript
class AgriGuruDashboard {
    constructor() {
        this.charts = {};
        this.weatherUpdateInterval = null;
        this.initializeDashboard();
        this.startRealTimeUpdates();
    }

    initializeDashboard() {
        this.initializeCharts();
        this.initializeModals();
        this.initializeTooltips();
        this.initializeRefreshButtons();
        this.loadDashboardData();
    }

    initializeCharts() {
        // Initialize price trend chart if canvas exists
        const priceChartCanvas = document.getElementById('priceChart');
        if (priceChartCanvas) {
            this.initializePriceChart(priceChartCanvas);
        }

        // Initialize yield comparison chart
        const yieldChartCanvas = document.getElementById('yieldChart');
        if (yieldChartCanvas) {
            this.initializeYieldChart(yieldChartCanvas);
        }

        // Initialize weather chart
        const weatherChartCanvas = document.getElementById('weatherChart');
        if (weatherChartCanvas) {
            this.initializeWeatherChart(weatherChartCanvas);
        }
    }

    initializePriceChart(canvas) {
        const ctx = canvas.getContext('2d');
        this.charts.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Rice (₹/quintal)',
                    data: [2400, 2450, 2420, 2480, 2500, 2520, 2550],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Wheat (₹/quintal)',
                    data: [2200, 2180, 2220, 2250, 2280, 2300, 2320],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Cotton (₹/quintal)',
                    data: [5200, 5150, 5300, 5400, 5350, 5450, 5500],
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Crop Price Trends (Last 7 Months)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price (₹/quintal)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    initializeYieldChart(canvas) {
        const ctx = canvas.getContext('2d');
        this.charts.yieldChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'],
                datasets: [{
                    label: 'Expected Yield (tons/hectare)',
                    data: [4.5, 3.2, 2.8, 85, 6.1],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(23, 162, 184, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(102, 16, 242, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(23, 162, 184, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(102, 16, 242, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Expected Crop Yields'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Yield (tons/hectare)'
                        }
                    }
                }
            }
        });
    }

    initializeWeatherChart(canvas) {
        const ctx = canvas.getContext('2d');
        this.charts.weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [25, 27, 23, 26, 28, 30, 29],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'Humidity (%)',
                    data: [60, 65, 70, 58, 55, 50, 52],
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weather Forecast (7 Days)'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    initializeModals() {
        // Farm record modal functionality
        const addRecordModal = document.getElementById('addRecordModal');
        if (addRecordModal) {
            addRecordModal.addEventListener('show.bs.modal', () => {
                this.clearModalForm();
            });
        }

        // Weather details modal
        const weatherModal = document.getElementById('weatherModal');
        if (weatherModal) {
            weatherModal.addEventListener('show.bs.modal', () => {
                this.loadDetailedWeather();
            });
        }
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initializeRefreshButtons() {
        // Weather refresh button
        const weatherRefreshBtn = document.getElementById('refreshWeather');
        if (weatherRefreshBtn) {
            weatherRefreshBtn.addEventListener('click', () => this.refreshWeatherData());
        }

        // Price refresh button
        const priceRefreshBtn = document.getElementById('refreshPrices');
        if (priceRefreshBtn) {
            priceRefreshBtn.addEventListener('click', () => this.refreshPriceData());
        }

        // Recommendations refresh button
        const recsRefreshBtn = document.getElementById('refreshRecommendations');
        if (recsRefreshBtn) {
            recsRefreshBtn.addEventListener('click', () => this.refreshRecommendations());
        }
    }

    async loadDashboardData() {
        try {
            // Load weather data
            await this.refreshWeatherData();
            
            // Load price data
            await this.refreshPriceData();
            
            // Load recommendations
            await this.refreshRecommendations();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    async refreshWeatherData() {
        try {
            this.showLoadingState('weather');
            
            // Get user location or default location
            const location = this.getUserLocation();
            
            const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
            const weatherData = await response.json();
            
            this.updateWeatherDisplay(weatherData);
            this.hideLoadingState('weather');
            
        } catch (error) {
            console.error('Error refreshing weather:', error);
            this.showNotification('Failed to update weather data', 'error');
            this.hideLoadingState('weather');
        }
    }

    async refreshPriceData() {
        try {
            this.showLoadingState('prices');
            
            const crops = this.getUserCrops();
            const promises = crops.map(crop => 
                fetch(`/api/price_analytics/${encodeURIComponent(crop)}`).then(r => r.json())
            );
            
            const priceData = await Promise.all(promises);
            this.updatePriceDisplay(priceData);
            this.hideLoadingState('prices');
            
        } catch (error) {
            console.error('Error refreshing prices:', error);
            this.showNotification('Failed to update price data', 'error');
            this.hideLoadingState('prices');
        }
    }

    async refreshRecommendations() {
        try {
            this.showLoadingState('recommendations');
            
            const response = await fetch('/api/crop_recommendations');
            const recommendations = await response.json();
            
            this.updateRecommendationsDisplay(recommendations);
            this.hideLoadingState('recommendations');
            
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
            this.showNotification('Failed to update recommendations', 'error');
            this.hideLoadingState('recommendations');
        }
    }

    updateWeatherDisplay(weatherData) {
        // Update current weather
        const tempElement = document.querySelector('[data-weather="temperature"]');
        if (tempElement) {
            tempElement.textContent = `${weatherData.current.temperature}°C`;
        }

        const humidityElement = document.querySelector('[data-weather="humidity"]');
        if (humidityElement) {
            humidityElement.textContent = `${weatherData.current.humidity}%`;
        }

        const descElement = document.querySelector('[data-weather="description"]');
        if (descElement) {
            descElement.textContent = weatherData.current.description;
        }

        // Update forecast
        const forecastContainer = document.querySelector('.weather-forecast');
        if (forecastContainer && weatherData.forecast) {
            forecastContainer.innerHTML = weatherData.forecast.map(day => `
                <div class="col-md-4 text-center">
                    <div class="weather-day p-3 border rounded">
                        <h6 class="fw-bold">${day.date}</h6>
                        <i class="fas fa-sun text-warning fa-2x mb-2"></i>
                        <p class="mb-1"><strong>${day.temp_high}° / ${day.temp_low}°</strong></p>
                        <small class="text-muted">${day.description}</small>
                    </div>
                </div>
            `).join('');
        }
    }

    updatePriceDisplay(priceData) {
        if (this.charts.priceChart && priceData.length > 0) {
            // Update chart with new data
            const labels = priceData.map(data => Object.keys(data)[0]);
            const prices = priceData.map(data => Object.values(data)[0].current_price);
            
            this.charts.priceChart.data.labels = labels;
            this.charts.priceChart.data.datasets[0].data = prices;
            this.charts.priceChart.update();
        }
    }

    updateRecommendationsDisplay(recommendations) {
        const recsContainer = document.querySelector('.recommendations-container');
        if (recsContainer) {
            recsContainer.innerHTML = recommendations.map(rec => `
                <div class="col-md-6 mb-3">
                    <div class="border rounded p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold mb-0">${rec.crop}</h6>
                            <span class="badge bg-success">${rec.suitability}% suitable</span>
                        </div>
                        <p class="text-muted mb-2">Season: ${rec.season}</p>
                        <p class="text-muted mb-2">Expected yield: ${rec.expected_yield}</p>
                        <div class="progress mb-2" style="height: 6px;">
                            <div class="progress-bar bg-success" style="width: ${rec.suitability}%"></div>
                        </div>
                        <small class="text-muted">
                            Reasons: ${rec.reasons.join(', ')}
                        </small>
                    </div>
                </div>
            `).join('');
        }
    }

    showLoadingState(section) {
        const spinner = document.querySelector(`[data-loading="${section}"]`);
        if (spinner) {
            spinner.style.display = 'block';
        }
    }

    hideLoadingState(section) {
        const spinner = document.querySelector(`[data-loading="${section}"]`);
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    getUserLocation() {
        // Get from user profile or default
        const locationElement = document.querySelector('[data-user="location"]');
        return locationElement ? locationElement.textContent : 'Delhi, India';
    }

    getUserCrops() {
        // Get from user profile or default
        const cropsElement = document.querySelector('[data-user="crops"]');
        const cropsText = cropsElement ? cropsElement.textContent : 'rice,wheat,cotton';
        return cropsText.split(',').map(crop => crop.trim());
    }

    clearModalForm() {
        const form = document.querySelector('#addRecordModal form');
        if (form) {
            form.reset();
        }
    }

    async loadDetailedWeather() {
        const weatherModal = document.querySelector('#weatherModal .modal-body');
        if (weatherModal) {
            weatherModal.innerHTML = '<div class="text-center"><div class="spinner"></div><p>Loading detailed weather...</p></div>';
            
            try {
                const location = this.getUserLocation();
                const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
                const data = await response.json();
                
                weatherModal.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Current Conditions</h6>
                            <p><strong>Temperature:</strong> ${data.current.temperature}°C</p>
                            <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                            <p><strong>Wind Speed:</strong> ${data.current.wind_speed} km/h</p>
                            <p><strong>Description:</strong> ${data.current.description}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Farming Recommendations</h6>
                            <ul class="list-unstyled">
                                <li><i class="fas fa-check text-success me-2"></i>Good conditions for irrigation</li>
                                <li><i class="fas fa-check text-success me-2"></i>Suitable for outdoor activities</li>
                                <li><i class="fas fa-exclamation-triangle text-warning me-2"></i>Monitor humidity levels</li>
                            </ul>
                        </div>
                    </div>
                `;
            } catch (error) {
                weatherModal.innerHTML = '<div class="alert alert-danger">Failed to load detailed weather information.</div>';
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    startRealTimeUpdates() {
        // Update weather every 10 minutes
        this.weatherUpdateInterval = setInterval(() => {
            this.refreshWeatherData();
        }, 10 * 60 * 1000);
        
        // Update prices every 30 minutes
        setInterval(() => {
            this.refreshPriceData();
        }, 30 * 60 * 1000);
    }

    destroy() {
        // Clean up intervals
        if (this.weatherUpdateInterval) {
            clearInterval(this.weatherUpdateInterval);
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Utility functions
function openWeatherModal() {
    const modal = new bootstrap.Modal(document.getElementById('weatherModal') || document.createElement('div'));
    modal.show();
}

function addFarmRecord() {
    const modal = new bootstrap.Modal(document.getElementById('addRecordModal'));
    modal.show();
}

function saveFarmRecord() {
    const form = document.querySelector('#addRecordModal form');
    if (form) {
        const formData = new FormData(form);
        
        // Here you would normally send to backend
        console.log('Saving farm record:', Object.fromEntries(formData));
        
        // Close modal and show success
        bootstrap.Modal.getInstance(document.getElementById('addRecordModal')).hide();
        
        if (window.agriGuruDashboard) {
            window.agriGuruDashboard.showNotification('Farm record saved successfully!', 'success');
        }
    }
}

function exportData(type) {
    // Mock export functionality
    const data = {
        weather: 'Weather data exported',
        prices: 'Price data exported',
        records: 'Farm records exported'
    };
    
    alert(`${data[type] || 'Data exported'} successfully!`);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agriGuruDashboard = new AgriGuruDashboard();
});

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    if (window.agriGuruDashboard) {
        window.agriGuruDashboard.destroy();
    }
});
