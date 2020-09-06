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
          throw err;
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
                    
                    querytext += `${key} = $${i}`;
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
          throw err;
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
            throw e;
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
          throw err;
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
          throw err;
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
                throw Error;
            }
        } else if(data2 === null) {
            if( !Array.isArray(data1) ) 
                data1 = [ data1 ];

            columns = [];
            values = [];
            columns = [ resolverequest(data1[0]).columns ];
            data1.forEach(request => {
                values.push(resolverequest(request).values);
            });

        } else {
            columns = data1;
            values = [ data2 ];
        }

        try{
            let cols = columns.join(', ');
    
            let values_str = "";
            let bindParams = [];
            let j = 1;
            let counter = 0;

            values.forEach(valGroup => {
                if(counter > 0) values_str += ', ';
                values_str += '(';

                for(let i = 0; i < valGroup.length; i++) {
                    if(i > 0)
                        values_str += ', ';

                    if(typeof valGroup[i] === 'object' && valGroup[i] != null) {
                        values_str += "'" + JSON.stringify(valGroup[i]) + "'";
                    } else {
                        bindParams.push(valGroup[i]);
                        values_str += `$${j}`;
                        j++;
                    }
                }

                values_str += ')';
                counter ++;
            });

            querytext = `INSERT INTO ${table} (${cols}) VALUES ${values_str} RETURNING *;`;

            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(values) console.debug('With Params', values);
            }

            let res = (cb) ? await cb.query(querytext, bindParams) : await pool.query(querytext, bindParams);
            if(data1.length > 1 && typeof data1[0] == 'object'  ) {
                return res.rows;
            }
            else
                return res.rows[0];

        } catch(err) {
            console.debug('QUERY TEXT', querytext);
            console.debug('With Params', values);
            throw err;
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
                if(values) console.debug('With Params', values);
            }

            return res.rows;
        } catch(e) {
            console.debug('QUERY TEXT', querytext);
            throw err;
        }
    },

    update: async(table, conditions, newValues) => {
        let querytext;
        let params = [];

        try{
            querytext = `UPDATE ${table} SET`
    
            let numberOfParameters = 1;

            for(let column in newValues) {
                
                if(numberOfParameters > 1) querytext += ", ";
                querytext+= ` ${column} = $${ numberOfParameters }`;

                params[ numberOfParameters - 1 ] = newValues[column];

                numberOfParameters++;
            }

            if(conditions) {
                querytext += ` WHERE `;
                let i = 0;
                for (key in conditions) {
                    params[numberOfParameters - 1] = conditions[key];
                    if(i>0) querytext += " AND ";
                    i++;
                    
                    querytext += `${key} = $${ numberOfParameters }`;
                    numberOfParameters++;
                }
            } else throw Error("No condition specified. Exiting!");
    
            if(todebug === true) {
                console.debug("Querytext", querytext);
                if(params) console.debug('With Params', params);
            }

            let res = await pool.query(`${querytext} RETURNING *;`, params);
            return res.rows;
        } catch(err) {
            console.debug('QUERY TEXT', querytext);
            console.debug('PARAMS', params);
            throw err;
        }
    },

    customquery: async(text, params = null) => {
        try{
            if(todebug === true) {
                console.debug("Querytext", text);
                if(params) console.debug('With Params', params);
            }

            let res = await pool.query(text, params);

            return res;
        } catch(e) {
            console.debug('QUERY (CUSTOM) FAILED', text);
            if(params) console.debug('WITH PARAMS', params);
            throw e;
        }
    },

    transaction: async(callback) => {
        const client = await pool.connect();
        let res;
        try {
            if(todebug === true) console.debug('Beginning SQL transaction');
            await client.query('BEGIN');
            try {
                res = await callback(client)
                client.query('COMMIT');
            } catch(e) {
                console.error('TRANSACTION ERROR');
                res = {status: e.name, detail: e.detail, constraint: e.constraint};
                client.query('ROLLBACK');
                throw e;
            }
        } finally {
            if(todebug === true) console.log("CLOSING CONNECTON");
            client.release();
        }
        return res;
    }    
}
