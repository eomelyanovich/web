const client = require('../connector')

const createCity = async (cityName) => {
  let _res = []

  const query = {
    text: 'INSERT INTO cities (city) values ($1);',
    values: [ cityName ]
  }

  _res = await client.query(query);

  return _res.rows
}

module.exports = createCity;
