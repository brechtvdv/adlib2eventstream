# Install

npm install db-migrate
npm install db-migrate-sqlite3

# Create SQLite database

````
node_modules/db-migrate/bin/db-migrate db:create evenstream
````

Make sure that a table is created for every adlib database you want to publish as an eventstream:
````
node_modules/db-migrate/bin/db-migrate create name_of_adlib_database --sql-file
````

Adapt the generated SQL files so there is a table with the name of the Adlib database and a table `"GeneratedAtTimeTo" + name of Adlib database`.
See also example for "objects" in the migrations folder.

Initialize all the tables:
```
node_modules/db-migrate/bin/db-migrate up
```

# Run

Rename `config.tml.example` to `config.tml` and fill in the password.
Run following command to start harvesting the Adlib database(s):

```
node bin/adlib2backend.js -r esm
```

When the SQLite database is empty, it will harvest all objects.
When this is not empty (when you run it as a cronjob), it will look up the last object and start fetching Adlib from that point on.

# Clean database

If you update the mapping of the eventstream, you need to refresh the whole database.
Run the db-migrate down command to clean the database:

```
node_modules/db-migrate/bin/db-migrate down
```
