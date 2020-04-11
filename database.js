const {Pool} = require("pg");

let pool;

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
    close: () => {
        return pool.end();
    },

    /**
     * @params conditions - {condition1: 'boo', condition2: 'ans', intcondition: [">", 1]}
     */
    list: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
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
        if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
        let results = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext};`, params) : await pool.query(`${querytext};`);
        return results.rows;
    },

    /**
     * @params paginateparams - is an object. {page, limit, sortby, sorttype - (asc, desc)}
     */
    paginate: async(table, paginateparams, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
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

        let res =  await pool.query(`${querytext};`, params);
        return res.rows;
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
            if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
            let res = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext} LIMIT 1;`, params) : await pool.query(`${querytext} LIMIT 1;`);

            return res.rows[0];
        } catch(e) {
            console.debug('QUERY TEXT', querytext);
        }
    },


    findonerandom: async(table, conditions = null) => {
        let params = null;
        let querytext = `SELECT * FROM ${table}`;
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
        let res;
        if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
        if(Array.isArray(params) && params.length > 0) {
            res =  await pool.query(`${querytext} ORDER BY random() LIMIT 1;`, params);
        } else {
            res = await pool.query(`${querytext} ORDER BY random() LIMIT 1;`);
        }
        return res.rows[0];
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
        if (Array.isArray(params) && params !== null) params = params.filter(x=> (x !== null) && (x!== undefined));
        let res = (Array.isArray(params) && params.length > 0) ? await pool.query(`${querytext} LIMIT 1;`, params) : await pool.query(`${querytext} LIMIT 10;`);

        return res.rows;
    },


    create: async(table, data1, data2 = null, cb = null) => {
        let querytext;
        let columns;
        let values;
        if(data2 === null) {
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
          
          let res = (cb) ? await cb.query(querytext, values) : await pool.query(querytext, values);
          return res.rows[0];
        } catch(err) {
          console.debug('QUERY TEXT', querytext);
          console.log('ERROR', err);
          throw Error;
        }
    },

    onetomanycreate: async(table, columns, values) => {
        one_to_many_create(table, columns, values);
    },

    one_to_many_create: async (table, columns, values) => {
        try {
            let querytext = `INSERT INTO ${table}(${columns[0]}, ${columns[1]}) 
            SELECT $1 id, x
            FROM    unnest(ARRAY[$2::int[]]) x;`;
            let res = await pool.query(querytext, values);
            return res.rows;
        } catch(e) {
            console.log("ERROR", e);
            return ('DB ERROR');
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
    
            let res = await pool.query(`${querytext};`, values);
            return res.rows[0];
        } catch(err) {
            console.debug('QUERY TEXT', querytext);
            console.log('ERROR', err);
            return "ERROR";
        }
    },

    customquery: async(text, params = null) => {
        try{
            let res = await pool.query(text, params);
            return res;
        } catch(e) {
            console.log("ERROR\n", e);
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
                console.log(e);
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
