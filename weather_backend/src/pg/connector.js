// dependecies
const { Client } = require('pg')

// client init
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'weatherdb',
  port: '5432'
})

client.connect()

module.exports = client
