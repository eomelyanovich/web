const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');

const getAll = require('./src/pg/cities/getAll');
const createCity = require('./src/pg/cities/createCity');
const deleteCity = require('./src/pg/cities/deleteCity');

const axios = require('axios');
const cors = require('cors');

const port = 5000;

server.listen(port);
app.use(bodyParser.json());
app.use(cors());

// получение списка всех городов
app.get('/cities/all', async (_req, res) => {
    const cities = await getAll();

    const body = JSON.stringify(cities);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(body);
    res.end();
});

// добавление нового города
app.post('/cities/create', async (req, res) => {
    const { body } = req;
    
    const { city } = body;

    const cities = await getAll();

    if (!cities.includes(city)) {
        const createdCity = await createCity(city);

        const responseBody = JSON.stringify(createdCity);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(responseBody);
        res.end();
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write('{"error": "city already exists"}');
        res.end();
    }
});

// удаление города
app.delete('/cities/delete', async (req, res) => {
    const { body } = req;
    const { city } = body;

    const cities = await getAll();

    if (!cities.includes(city)) {
        const deletedCity = await deleteCity(city);

        const responseBody = JSON.stringify(deletedCity);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(responseBody);
        res.end();
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write('{"error": "city is not exist"}');
        res.end();
    }
})

// получение погоды
const getUrl = (params) => {
    const { path, q, lat, lon } = params;

    const baseUrl = 'https://api.openweathermap.org/data/2.5/';

    const apiKey = 'ea0e178f344b162038e647a40559937f';

    const url = `${baseUrl}/${path}?q=${q},ru&lat=${lat}&lon=${lon}&units=metric&APPID=${apiKey}`;

    return url;
};

// получение по городу
app.get('/weather/city', async (req, res) => {
    const { query } = req;
    const { q } = query;

    const params = {
        path: 'weather',
        q
    };

    const url = getUrl(params);

    try {
        const response = await axios({
            method: 'GET',
            url
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(response.data));
        res.end();
    } catch (e) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write('{"error": "city is not found"}');
        res.end();
    }
})

// получение по координатам
app.get('/weather/coordinates', async (req, res) => {
    const { query } = req;
    const { lat, lon } = query;

    const params = {
        path: 'weather',
        lat,
        lon
    };

    const url = getUrl(params);

    try {
        const response = await axios({
            method: 'GET',
            url
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(response.data));
        res.end();
    } catch (e) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write('{"error": "city is not found"}');
        res.end();
    }

});
