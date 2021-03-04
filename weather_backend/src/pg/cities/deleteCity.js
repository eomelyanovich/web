const client = require('../connector')

const deleteCity = async (cityName) => {

  let _res = []

  const query = {
    text: 'DELETE FROM cities WHERE city = $1;',
    values: [cityName]
  }

  _res = await client.query(query);

  return _res.rows
}

module.exports = deleteCity;
