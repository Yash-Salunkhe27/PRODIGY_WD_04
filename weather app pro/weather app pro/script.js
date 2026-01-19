
const API_KEY = 'ea17fb7fc396b5a04e2e39c06ab88826';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

// ============================================
// DOM ELEMENTS
// ============================================

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherCard = document.getElementById('weatherCard');

// Weather display elements
const cityNameEl = document.getElementById('cityName');
const countryEl = document.getElementById('country');
const temperatureEl = document.getElementById('temperature');
const weatherConditionEl = document.getElementById('weatherCondition');
const weatherIconEl = document.getElementById('weatherIcon');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');

// ============================================
// API FETCHING LOGIC
// ============================================

/**
 * Fetches weather data from OpenWeatherMap API by city name
 * @param {string} cityName - Name of the city to search for
 * @returns {Promise<Object>} Weather data object
 */
async function fetchWeatherByCity(cityName) {
    try {
        const url = `${API_BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the city name and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Re-throw network errors
        if (error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

/**
 * Fetches weather data from OpenWeatherMap API by coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Weather data object
 */
async function fetchWeatherByCoordinates(latitude, longitude) {
    try {
        const url = `${API_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Re-throw network errors
        if (error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

// ============================================
// GEOLOCATION LOGIC
// ============================================

/**
 * Gets the user's current location using browser's Geolocation API
 * @returns {Promise<Object>} Object with latitude and longitude
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                let errorMessage = 'Location access denied. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access or search for a city manually.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                timeout: 10000,
                enableHighAccuracy: true
            }
        );
    });
}

// ============================================
// DOM MANIPULATION LOGIC
// ============================================

/**
 * Shows the loading spinner and hides other elements
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

/**
 * Hides the loading spinner
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    hideLoading();
}

/**
 * Hides the error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Displays weather data on the page
 * @param {Object} data - Weather data object from API
 */
function displayWeather(data) {
    // Extract data from API response
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    // Update DOM elements
    cityNameEl.textContent = city;
    countryEl.textContent = country;
    temperatureEl.textContent = `${temp}°C`;
    weatherConditionEl.textContent = description;
    feelsLikeEl.textContent = `${feelsLike}°C`;
    humidityEl.textContent = `${humidity}%`;
    windSpeedEl.textContent = `${windSpeed} m/s`;
    
    // Set weather icon
    weatherIconEl.src = `${ICON_BASE_URL}${iconCode}@2x.png`;
    weatherIconEl.alt = description;

    // Show weather card and hide loading/error
    weatherCard.classList.remove('hidden');
    hideLoading();
    hideError();
}

// ============================================
// EVENT HANDLING LOGIC
// ============================================

/**
 * Handles the search button click event
 */
async function handleSearch() {
    const cityName = cityInput.value.trim();

    if (!cityName) {
        showError('Please enter a city name.');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please configure your API key in script.js file.');
        return;
    }

    showLoading();
    hideError();

    try {
        const weatherData = await fetchWeatherByCity(cityName);
        displayWeather(weatherData);
        cityInput.value = ''; // Clear input after successful search
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Handles the location button click event
 */
async function handleLocationClick() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please configure your API key in script.js file.');
        return;
    }

    showLoading();
    hideError();

    try {
        const location = await getCurrentLocation();
        const weatherData = await fetchWeatherByCoordinates(location.latitude, location.longitude);
        displayWeather(weatherData);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Handles Enter key press in the city input field
 * @param {KeyboardEvent} event - Keyboard event object
 */
function handleInputKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Search button click event
searchBtn.addEventListener('click', handleSearch);

// Location button click event
locationBtn.addEventListener('click', handleLocationClick);

// Enter key press in input field
cityInput.addEventListener('keypress', handleInputKeyPress);

// ============================================
// INITIALIZATION
// ============================================

// Check if API key is configured on page load
window.addEventListener('DOMContentLoaded', () => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please configure your API key in script.js file. See the instructions at the top of the file.');
    }
});

