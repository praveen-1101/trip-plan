

const API_KEY = 'fb09a3dc847ff4a9e4ba2b5a5bece713';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getWeatherData(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    console.log("weather data",data.weather);
    return {
      main: {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity
      },
      weather: data.weather,
      wind: data.wind,
      clouds: data.clouds,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

export async function getForecast(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Forecast data fetch failed');
    }
    
    const data = await response.json();
    
    // Process the forecast data to get daily averages
    const dailyForecasts = data.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          dt: item.dt,
          main: {
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            humidity: item.main.humidity,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max
          },
          weather: item.weather[0],
          wind: {
            speed: item.wind.speed,
            deg: item.wind.deg
          },
          clouds: item.clouds,
          pop: item.pop,
          count: 1
        };
      } else {
        // Update min/max temperatures
        acc[date].main.temp_min = Math.min(acc[date].main.temp_min, item.main.temp_min);
        acc[date].main.temp_max = Math.max(acc[date].main.temp_max, item.main.temp_max);
        // Update average temperature
        acc[date].main.temp = (acc[date].main.temp * acc[date].count + item.main.temp) / (acc[date].count + 1);
        // Update average humidity
        acc[date].main.humidity = (acc[date].main.humidity * acc[date].count + item.main.humidity) / (acc[date].count + 1);
        // Update average cloud cover
        acc[date].clouds.all = (acc[date].clouds.all * acc[date].count + item.clouds.all) / (acc[date].count + 1);
        acc[date].count++;
      }
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const forecastArray = Object.values(dailyForecasts)
      .sort((a, b) => a.dt - b.dt)
      .slice(0, 5) // Get next 5 days
      .map(item => ({
        dt: item.dt,
        main: {
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          humidity: Math.round(item.main.humidity),
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max)
        },
        weather: item.weather,
        wind: {
          speed: Math.round(item.wind.speed),
          deg: item.wind.deg
        },
        clouds: {
          all: Math.round(item.clouds.all)
        },
        pop: Math.round(item.pop * 100),
        city: {
          name: data.city.name,
          country: data.city.country,
          coord: {
            lat: data.city.coord.lat,
            lon: data.city.coord.lon
          }
        }
      }));
    
    return forecastArray;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return [];
  }
}