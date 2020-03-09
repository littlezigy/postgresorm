# PostgresORM

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
`const db = require('postgresorm')`<br />
- create(`'table'`, `columns`, `values`) - Creates a new record in `table`.<br />
  `'table'`: Name of table to create record in <br />
  `columns`: An array of table columns corresponding to `values` <br />
  `values`: An array of values to be inserted into table corresponding to `columns` <br />
- list('table', `conditions`) - Lists records in table <br />
  `'table'`: Name of table from which to list records<br />

  `conditions`: Filters records. eg, `_id = 1`, `price < 200`. Can be null<br />
- paginate(`'table'`, `paginateparams`, `conditions`) - Paginates records from a table.  <br />
  `'table'`: Table to fetch records from
  `paginateparams`: Contains options for the paginate function <br />
  ```
  paginateparams = {
      sortby: _ASC_ or _DESC_,
      limit: An integer eg _10_,
      page: current page of pagination. Also an integer
  }
  ```
- findone(`'table'`, `conditions`)
  - You know the drill..

- findonerandom(`'table'`, `conditions`)
- onetomanycreate(`'table'`, `columns`, `values`)
- update(`'table'`, `columns`, `values`, `conditions`)
- customquery(`querytext`, `parameters`)
  - `querytext`: SQL query string. 
  - `parameters`: values<br /> <br />
  > Keep your application safe by using parameterized queries. Do this: <br />
  ```
  querytext = `SELECT * from example_table where username = $1;`<br />
  parameters = ['sampleuser']
  ```
  > And never this:<br />
  ```
  querytext = `SELECT * from example_table where username = 'sampleuser';`
  ```
- transaction(`callback`)<br />
  In `callback`, write your SQL queries<br />


