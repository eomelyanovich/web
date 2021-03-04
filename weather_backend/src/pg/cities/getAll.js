const client = require('../connector')

const getAll = async () => {

  let _res = []

  let query = {
    text: 'SELECT * FROM cities;'
  }

  _res = await client.query(query);

  return _res.rows
}

module.exports = getAll;
