document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("weatherForm");
    const cityInput = document.getElementById("cityInput");
    const weatherInfo = document.getElementById("weatherInfo");
    const cityName = document.getElementById("cityName");
    const temperature = document.getElementById("temperature");
    const humidity = document.getElementById("humidity");
    const condition = document.getElementById("condition");
    const weatherIcon = document.getElementById("weatherIcon");
    const errorText = document.getElementById("error");
    const geoLocationBtn = document.getElementById("geoLocation");
    const toggleUnit = document.getElementById("toggleUnit");
    const loader = document.createElement("div");
    loader.className = "loader hidden";
    document.body.appendChild(loader);
    let isCelsius = true;

    // Open-Meteo API URL
    const API_URL = "https://api.open-meteo.com/v1/forecast?";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) return;
        fetchWeather(city);
    });

    geoLocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            }, () => {
                errorText.textContent = "Geolocation not available.";
            });
        }
    });

    // Function to fetch weather using city name
    async function fetchWeather(city) {
        try {
            showLoader();
            // Use geocoding API to get the latitude and longitude of the city (you can also hardcode coordinates)
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
            const geoData = await geoResponse.json();
            const { latitude, longitude } = geoData.results[0];

            // Now fetch the weather data from Open-Meteo using the latitude and longitude
            const response = await fetch(`${API_URL}latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
            const data = await response.json();
            hideLoader();
            updateUI(data);
        } catch (error) {
            hideLoader();
            errorText.textContent = "City not found. Please try again.";
        }
    }

    // Function to fetch weather using geolocation
    async function fetchWeatherByCoords(lat, lon) {
        try {
            showLoader();
            const response = await fetch(`${API_URL}latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
            const data = await response.json();
            hideLoader();
            updateUI(data);
        } catch (error) {
            hideLoader();
            errorText.textContent = "Error fetching data.";
        }
    }

    // Function to update the UI with weather data
    function updateUI(data) {
        const currentWeather = data.current_weather;
        const hourlyTemp = data.hourly.temperature_2m[0]; // First hourly temperature (you can select a different index)
    
        // Ensure currentWeather and hourlyTemp are valid before accessing their properties
        if (currentWeather && hourlyTemp !== undefined) {
            cityName.textContent = cityInput.value; // City name is taken from the input
            temperature.textContent = `Temperature: ${hourlyTemp}°C`; // Use hourly temperature
            humidity.textContent = `Humidity: ${data.hourly.relative_humidity_2m[0]}%`; // Use first hourly humidity value
            condition.textContent = "Weather data"; // Open-Meteo doesn't provide a weather description, but you can add something else here
            weatherIcon.src = "http://openweathermap.org/img/wn/01d.png"; // Placeholder, Open-Meteo doesn't provide icons
            weatherInfo.classList.remove("hidden");
            gsap.from("#weatherInfo", { opacity: 0, y: -20, duration: 1 });
        } else {
            errorText.textContent = "Weather data not available.";
        }
    }
    

    function showLoader() {
        loader.classList.remove("hidden");
    }

    function hideLoader() {
        loader.classList.add("hidden");
    }

    toggleUnit.addEventListener("click", () => {
        let temp = parseFloat(temperature.textContent.split(" ")[1]);
        if (isCelsius) {
            temp = (temp * 9/5) + 32;
            temperature.textContent = `Temperature: ${temp.toFixed(2)}°F`;
            toggleUnit.textContent = "Switch to °C";
        } else {
            temp = (temp - 32) * 5/9;
            temperature.textContent = `Temperature: ${temp.toFixed(2)}°C`;
            toggleUnit.textContent = "Switch to °F";
        }
        isCelsius = !isCelsius;
    });
});
