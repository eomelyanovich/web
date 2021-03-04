// client
const client = require('./connector');

const migrationsDir = '/home/regatio/web/weather_backend/migrations';

// dependecies
const fs = require('fs');

const getMigrations = () => {
  // read migrations dir
  let migrations = fs.readdirSync(migrationsDir);

  // get abspath for each migration
  migrations = migrations.map((filename) => {
    return `${migrationsDir}/${filename}`;
  });

  // get query from each migration
  migrations = migrations.map((abspath) => {
    return fs.readFileSync(abspath, 'utf-8');
  })

  return migrations;
}

const migrate = () => {
  let migrations = getMigrations();
  console.log(migrations);

  for (migration of migrations) {
    client.query(migration, (err, res) => {
      if (err) throw err
      console.log('INSERTED')
    })
  }

  return null;
}

migrate();
