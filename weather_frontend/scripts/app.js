const CITY_NAME_INPUT_ID = 'cityName';

const CURRENT_WEATHER = {
    temp: 'main-info__temp',
    clouds: 'main-info__clouds',
    humidity: 'main-info__humidity',
    pressure: 'main-info__pressure',
    coord: 'main-info__coords',
    iconUrl: 'main-info__img',
    name: 'main-info__name',
    wind: 'main-info__wind'
};

const getUrl = (params) => {
    const { path, q, lat, lon } = params;

    // const baseUrl = 'https://api.openweathermap.org/data/2.5/';
    const baseUrl = 'http://localhost:5000';

    // const apiKey = 'ea0e178f344b162038e647a40559937f';

    const url = `${baseUrl}/${path}?q=${q}&lat=${lat}&lon=${lon}`;

    return url;
};

const getWeatherByCityName = async (cityName) => {
    const params = {
        path: 'weather/city',
        q: cityName        
    };

    const url = getUrl(params);

    const response = await fetch(url);

    const responseJson = await response.json();

    if (responseJson.cod !== 200) {
        alert('Такой город не найден');
        return;
    }

    return responseJson;
};

const parseWeaherParams = (weatherResponse) => {
    const { wind, clouds, main, weather, coord, name } = weatherResponse

    const { pressure, humidity, temp } = main

    const { icon } = weather[0]

    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`

    const weatherParams = {
        wind: wind.speed,
        clouds: clouds.all,
        pressure,
        humidity,
        temp,
        iconUrl,
        coord: `[${coord.lat}, ${coord.lon}]`,
        name
    }

    return weatherParams
};

const getElementsCount = (selector) => {
    const elements = document.querySelectorAll(selector);

    const elementsArray = Array.from(elements);

    return elementsArray.length
};

const removeCity = async (cityName) => {
    const cityElem = document.querySelector(`.city-${cityName}`);

    const url = 'http://localhost:5000/cities/delete';

    const response = await fetch(url, {
        method: 'DELETE',
        body: JSON.stringify({ city: cityName }),
        headers: { 'Content-type': 'application/json' }
    });

    const responseJson = await response.json();


    return cityElem.remove()
};

const renderWeatherHTML = (weatherParams) => {
    const { 
        wind,
        clouds,
        pressure,
        humidity,
        temp,
        iconUrl,
        coord,
        name
    } = weatherParams

    const defaultHTML = `
        <div class="favorite-deck__item city-${name}">
            <header class="deck-item__title row w-100">
                <strong class="row__item title title--lower">
                    ${name}
                </strong>
                <span class="temp title title--lower row__item">
                    ${temp}
                </span>
                <img
                    src="${iconUrl}"
                    alt="Иконка погоды"
                    class="row__item weather-icon"
                >

                <button
                    class="btn btn--default rounded--circle ml-auto"
                    onclick="removeCity('${name}')"
                >
                    &times;
                </button>
            </header>
            <ul class="deck-item__body unstyled-list ml-0">
                <li class="list-item">
                    <strong class="list-item__title">Ветер</strong>
                    <span class="list-item__info">${wind}</span>
                </li>
                <li class="list-item">
                    <strong class="list-item__title">Облачность</strong>
                    <span class="list-item__info">${clouds}</span>
                </li>
                <li class="list-item">
                    <strong class="list-item__title">Давление</strong>
                    <span class="list-item__info">${pressure}</span>
                </li>
                <li class="list-item">
                    <strong class="list-item__title">Влажность</strong>
                    <span class="list-item__info">${humidity}</span>
                </li>
                <li class="list-item">
                    <strong class="list-item__title">Кординаты</strong>
                    <span class="list-item__info">${coord}</span>
                </li>
            </ul>
        </div>
    `;

    const firstColSelector = '.favorite-deck .col:nth-child(1)';
    const secondColSelector = '.favorite-deck .col:nth-child(2)';

    const colsCounts = [
        getElementsCount(`${firstColSelector} .favorite-deck__item`),
        getElementsCount(`${secondColSelector} .favorite-deck__item`)
    ];

    if (colsCounts[0] <= colsCounts[1]) {
        document.querySelector(firstColSelector).innerHTML += defaultHTML
    } else {
        document.querySelector(secondColSelector).innerHTML += defaultHTML
    };
};

const showWeather = (weatherResponse) => {
    const weatherParams = parseWeaherParams(weatherResponse);

    renderWeatherHTML(weatherParams);
};

const submitForm = async () => {
    const event = this.event;

    event.preventDefault();

    const form = event.target;

    const cityName = form.querySelector(`#${CITY_NAME_INPUT_ID}`).value;

    if (!cityName) {
        alert('Вы ничего не ввели');
        return;
    }

    const weatherResponse = await getWeatherByCityName(cityName);

    const { name } = weatherResponse;

    const url = 'http://localhost:5000/cities/create';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ city: name }),
            headers: { 'Content-type': 'application/json' }
        });

        const responseJson = await response.json();

        showWeather(weatherResponse);

        form.reset();
    } catch (e) {
        alert(`Город ${cityName} уже есть в списке`)
        return false;
    }
};

const showCurrentWeather = (weatherResponse) => {
    const weatherParams = parseWeaherParams(weatherResponse);

    const weatherKeys = Object.keys(weatherParams);

    for (const key of weatherKeys) {
        const isIcon = key === 'iconUrl';

        if (!isIcon) {
            document
                .querySelector(`.${CURRENT_WEATHER[key]}`)
                .innerHTML = weatherParams[key];
        } else {
            document
                .querySelector(`.${CURRENT_WEATHER[key]} img`)
                .src = weatherParams[key];
        }
    }
};

const getGeolocation = () => {
    navigator.geolocation.getCurrentPosition(loadCurrentWeather);
};

const loadCurrentWeather = async (position) => {
    const { coords } = position;

    const { latitude, longitude } = coords;

    const params = {
        path: 'weather/coordinates',
        lat: latitude,
        lon: longitude
    };

    const url = getUrl(params);

    const response = await fetch(url);

    const responseJson = await response.json();

    showCurrentWeather(responseJson);
};

const loadCities = async () => {
    const url = 'http://localhost:5000/cities/all';

    const response = await fetch(url);
    const responseJson = await response.json();

    return responseJson;
};

document.addEventListener('DOMContentLoaded', async () => {
    getGeolocation();

    const currCities = await loadCities();

    console.log('curr cities', currCities);

    for (const currCity of currCities) {
        const weatherResponse = await getWeatherByCityName(currCity.city);
        showWeather(weatherResponse)
    };
});

document.querySelector('.update-geolocation')
    .addEventListener('click', getGeolocation);
