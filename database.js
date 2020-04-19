const {Pool} = require("pg");



let pool;
let todebug = false;

const resolverequest = function(data) {
    let columns = Object.keys(data);
    let values = Object.values(data);
    return {columns, values}
}
module.exports = {
    initializeDatabase: (config) => {
        const db = {
            connectionString: config.connectionString,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis
        }

        pool = new Pool(db);
    },
    debug: (debugStatements = true) => {
        todebug = debugStatements;
    },
    close: () => {
        return pool.end();
    },

    /**
     * @params conditions - {condition1: 'boo', condition2: 'ans', intcondition: [">", 1]}
     */
    list: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
        try {
            if(conditions) {
                params = [];
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[i] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    if(!conditions[key] || conditions[key] === null) querytext += key;
                    else querytext += `${key} = $${i}`;
                }
            }

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }
            if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
            let results = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext};`, params) : await pool.query(`${querytext};`);
            return results.rows;
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.error('ERROR', err);
          throw Error;
        }
    },

    /**
     * @params paginateparams - is an object. {page, limit, sortby, sorttype - (asc, desc)}
     */
    paginate: async(table, paginateparams, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
        try {
            if(conditions) {
                params = [];
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[i] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    
                    querytext += `${key} $${i}`;
                }
            }
            if(paginateparams.sortby) querytext += ` ORDER BY ${paginateparams.sortby}`;
            if(paginateparams.sorttype) querytext += ` ${paginateparams.sorttype}`;
            if(paginateparams.limit) querytext += ` LIMIT ${paginateparams.limit}`;
            if(paginateparams.page) querytext += ` OFFSET ${(paginateparams.page-1) * paginateparams.limit}`;

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            let res =  await pool.query(`${querytext};`, params);
            return res.rows;
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.error('ERROR', err);
          throw Error;
        }
    },

    findone: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
        if(typeof conditions !== 'object') throw new Error("Second argument must be an object");

        try {
            if(conditions) {
                params = [];
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[i] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    if(!conditions[key] || conditions[key] === null) querytext += key;
                    else querytext += `${key} = $${i}`;
                }
            }

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
            let res = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext} LIMIT 1;`, params) : await pool.query(`${querytext} LIMIT 1;`);

            if(res.rows.length < 1) return false;
            return res.rows[0];
        } catch(e) {
            console.debug('QUERY TEXT', querytext);
        }
    },


    findonerandom: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
        try {
            if(conditions) {
                params = [];
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[i] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    if(!conditions[key] || conditions[key] === null) querytext += key;
                    else querytext += `${key} $${i}`;
                }
            }
            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }


            let res;
            if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
            if(Array.isArray(params) && params.length > 0) {
                res =  await pool.query(`${querytext} ORDER BY random() LIMIT 1;`, params);
            } else {
                res = await pool.query(`${querytext} ORDER BY random() LIMIT 1;`);
            }
            return res.rows[0];
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.error('ERROR', err);
          throw Error;
        }
    },

    /**
     *  conditions: {param1: ['value1', 'value2', value3],
                     param2: ['value4', value5, value6]};

     *  querytext = select * from table where param1 in (value1, value2, value3) and params2 in (value4, value5, value6)
    */
    findall: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
        if(typeof conditions !== 'object') throw new Error("Second argument must be an object");

        try {
            if(conditions) {
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    let values = conditions[key].join("', '");
                    if(i>0) querytext += " AND ";
                    i++;
                    querytext +=  ` ${key} in ( '${ values }' )`;
                }
            }

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
            let res = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext} LIMIT 1;`, params) : await pool.query(`${querytext} LIMIT 10;`);

            return res.rows;
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.error('ERROR', err);
          throw Error;
        }
    },


    create: async(table, data1 = null, data2 = null, cb = null) => {
        let querytext;
        let columns;
        let values;
        if(data1 === null) {
            querytext = `INSERT INTO ${table} DEFAULT VALUES RETURNING *`;
            try {
                let res = (cb) ? await cb.query(querytext, values) : await pool.query(querytext, values);
                return res.rows[0];
            } catch(err) {
                console.debug('QUERY TEXT', querytext);
                console.error('ERROR', err);
                throw Error;
            }
        } else if(data2 === null) {
            columns = resolverequest(data1).columns;
            values = resolverequest(data1).values;
        } else {
            columns = data1;
            values = data2;
        }

        try{
          let cols = columns.join(', ');
    
          let values_str = "";
          for(i=1; i<=values.length; i++) {
            if(i == values.length) values_str+= `$${i}`;
            else values_str += `$${i}, `;
          }
          
          querytext = `INSERT INTO ${table} (${cols}) VALUES(${values_str}) RETURNING *;`;

          if(todebug === true) {
              console.debug("Querytext", querytext);
              if(params) console.debug('With Params', params);
          }

          let res = (cb) ? await cb.query(querytext, values) : await pool.query(querytext, values);
          return res.rows[0];
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.error('ERROR', err);
          throw Error;
        }
    },

    onetomanycreate: async(table, columns, values) => {
        one_to_many_create(table, columns, values);
    },

    one_to_many_create: async (table, columns, values) => {
        let querytext = `INSERT INTO ${table}(${columns[0]}, ${columns[1]}) 
            SELECT $1 id, x
            FROM    unnest(ARRAY[$2::int[]]) x;`;
        try {
            let res = await pool.query(querytext, values);

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            return res.rows;
        } catch(e) {
            console.error("ERROR", e);
            console.debug('QUERY TEXT', querytext);
            return ('DB ERROR');
            throw Error;
        }
    },

    update: async(table, columns, values, conditions) => {
        let querytext;
        try{
            querytext = `UPDATE ${table} SET`
    
            for(i=1; i<=columns.length; i++) {
            
                if(i>1) querytext += ", ";
                querytext+= ` ${columns[i]} = $${i}`;
            }

            if(conditions) {
                params = [];
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[i] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    
                    querytext += `${key} $${i}`;
                }
            } else throw Error("No condition specified. Exiting!");
    
            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            let res = await pool.query(`${querytext};`, values);
            return res.rows[0];
        } catch(err) {
            console.debug('QUERY TEXT', querytext);
            console.error('ERROR', err);
            return "ERROR";
        }
    },

    customquery: async(text, params = null) => {
        try{
            let res = await pool.query(text, params);
            return res;
        } catch(e) {
            console.debug('QUERY TEXT', text);
            if(params) console.debug('WITH PARAMS', params);
            console.error("ERROR\n", e);
            return "Error";
        }
    },

    transaction: async(callback) => {
        const client = await pool.connect();
        let res = {};
        try {
            console.debug('Beginning SQL transaction');
            await client.query('BEGIN');
            try {
                res.data = await callback(client)
                client.query('COMMIT');
                res.status=true;
            } catch(e) {
                console.error(e);
                res = {status: e.name, detail: e.detail, constraint: e.constraint};
                client.query('ROLLBACK');
                throw e;
            }
        } finally {
            console.log("CLOSING CONNECTON");
            client.release();
        }
        return res;
    }    
}
