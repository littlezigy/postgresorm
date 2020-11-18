# PostgresORM

A very basic ORM for PostgreSQL

## Install
```
npm i postgresorm
```
## Setup
- Setup database configuration in configuration file, eg config.js
`config.js`

```
const configObject = {
    connectionString: "postgres://username:password@host:port/database",
    max: config.max,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis
}
```
<hr />
<br />

- Initialize the database in your `app.js` file<br />

`app.js`

```
initializeDatabase(configObject);` <br />
```
<hr />
<br />


### ORM Commands
To use in model file, import module first <br />
```
const pg = require('postgresorm')

const db = pg.db()
```

OR

```
const pg = require('postgresorm')

const client = await pg.pool.connect();

const db = pg.db(client)
```
- db.create(`'table'`, `data`) - Creates a new record in `table`. Similar to the `INSERT` command<br />
  `'table'`: Name of table to create record in <br />
  `data`: Object of table values
    ```
    data = {
        name: 'Meena',
        piece: 'Rook',
        level: 20
    }
    ```
- db.list('table', `conditions`) - Lists records in `table`<br />
  `'table'`: Name of table from which to list records<br />

  `conditions`: _Optional_ Filters records. eg, `_id = 1`, `price < 200`.<br />
- db.paginate(`'table'`, `paginateparams`, `conditions`) - Paginates records from a table.  <br />
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
- db.findone(`'table'`, `conditions`)
  - conditions = { column1: 'value', column2: 'othervalue'} will search for and record a single record where column1 = `value` and column2 = `othervalue'
  - You know the drill..

- db.findonerandom(`'table'`, `conditions`)
- db.onetomanycreate(`'table'`, `columns`, `values`)
- db.update(`'table'`, `conditions`, `newValues`)
- db.customquery(`querytext`, `parameters`)
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
- db.transaction(`callback`)<br />
  In `callback`, write your SQL queries<br />
  For example: </br >
  ```
    await db.transaction(client => {
        let newUser = await db.create('users', {email: 'meena@rook.com', name: 'Meena'}, client);
        let newWallet = await db.create('wallets', {user_id: newUser.id, balance: 0}, client);
    });
  ```


