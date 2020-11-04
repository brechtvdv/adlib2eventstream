# Install

npm install db-migrate
npm install db-migrate-sqlite3

# Create DB

node_modules/db-migrate/bin/db-migrate db:create evenstream
node_modules/db-migrate/bin/db-migrate up

Make sure that a table is created with the same name as an adlib database
For coghent, this is "objecten", "thesaurus" and "personen"

# Harvest batch

First, fetch the whole dataset
This will clean the directory

node_modules/db-migrate/bin/db-migrate down

node_modules/db-migrate/bin/db-migrate up

node bin/adlib2backend.js -r esm

# Cronjob

This will fetch the latest modified objects

node bin/adlib2backend.js -r esm