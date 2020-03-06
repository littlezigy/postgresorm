jest.mock('pg');
let { Pool } = require('pg');
let query = jest.spyOn(Pool.prototype, 'query');
const db = require('../database');


describe('Create Record in table', function() {
    beforeAll(()=> {
        db.initializeDatabase({connectionString: "Blah"});
    });

    test('Create record with multiple columns', function() {
        db.create('tabletest', ['poo', 'bam'], ['boor', 'peer']);
        expect(query).toHaveBeenCalledWith("INSERT INTO tabletest (poo, bam) VALUES($1, $2) RETURNING *;", ["boor", "peer"]);
    });
});
