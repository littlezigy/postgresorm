##PostgresORM

A very basic ORM for PostgreSQL

## How to use
- First install: npm i postgresorm
- Initialize the database in your `app.js` file.readme.md markdown <br />
`initializeDatabase(configObject);` <br />
```
        const configObject = {
            connectionString: "postgres://username:password@host:port/database",
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis
        }
```


### ORM Commands
To use in model file, import module first <br />
`const db = require('postgresorm')`
- create('table', columns, values) - Creates a new record in `table`.<br />
  `'table'`: Name of table to create record in
  `columns`: An array of table columns corresponding to `values`
  `values`: An array of values to be inserted into table corresponding to `columns`
- list('table', conditions) - Lists records in table <br />
  `'table'`: Name of table from which to list records
  `conditions`: Filters records. eg, `_id = 1`, `price < 200`. Can be null


Uses the `pg` module
