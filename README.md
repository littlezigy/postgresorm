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
- create(`'table'`, `data`) - Creates a new record in `table`.<br />
  `'table'`: Name of table to create record in <br />
  `data`: Object of table values
    ```
    data = {
        name: 'Meena',
        piece: 'Rook',
        level: 20
    }
    ```
- list('table', `conditions`) - Lists records in table <br />
  `'table'`: Name of table from which to list records<br />

  `conditions`: _Optional_ Filters records. eg, `_id = 1`, `price < 200`.<br />
- paginate(`'table'`, `paginateparams`, `conditions`) - Paginates records from a table.  <br />
  - `'table'`: Table to fetch records from
  - `paginateparams`: Contains options for the paginate function <br />
  ```
  paginateparams = {
      sortby: _ASC_ or _DESC_,
      limit: An integer eg _10_,
      page: current page of pagination. Also an integer
  }
  ```
  - conditions: _Optional_ Filters records.
- findone(`'table'`, `conditions`)
  - conditions = { column1: 'value', column2: 'othervalue'} will search for and record a single record where column1 = `value` and column2 = `othervalue'
  - You know the drill..

- findonerandom(`'table'`, `conditions`)
- onetomanycreate(`'table'`, `columns`, `values`)
- update(`'table'`, `columns`, `values`, `conditions`)
- customquery(`querytext`, `parameters`)
  - `querytext`: SQL query string. 
  - `parameters`: values. _Optional_<br /> <br />
  > Keep your application safe by using parameterized queries. Do this: <br />
  ```
  querytext = `SELECT * from example_table where username = $1;`
  parameters = ['sampleuser']
  ```
  > And never this:<br />
  ```
  querytext = `SELECT * from example_table where username = 'sampleuser';`
  ```
- transaction(`callback`)<br />
  In `callback`, write your SQL queries<br />


