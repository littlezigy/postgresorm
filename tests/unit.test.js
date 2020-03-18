let { Pool } = require('pg');
let query = jest.spyOn(Pool.prototype, 'query');
const db = require('../database');

beforeAll(async()=> {
    db.initializeDatabase({connectionString: `postgresql://${process.env.PGORM_USER}:${process.env.PGORM_PASSWORD}@${process.env.PGORM_HOST}:${process.env.PGORM_PORT}/pgorm_dev_db`});
    let query = `CREATE TABLE test(
        _id serial primary key,
        foo varchar(20),
        bar varchar(20)
    );
    INSERT INTO test(foo, bar) VALUES('findme', 'boo');`

    let blah = await db.customquery(query);
    console.log("BLAH", blah);
});

afterAll(async() => {
    await db.customquery('DROP TABLE test;');
});

describe('Create Record in table', function() {
        test('Create record with multiple columns', async function() {
        let res = await db.create('test', ['foo', 'bar'], ['boor', 'peer']);
        expect(res).toHaveProperty("foo", "boor");
    });
    test('Create record with multiple columns using object notation', async function() {
        let res = await db.create('test', {foo: 'moor', bar: 'fear'});
        expect(res).toHaveProperty("foo", "moor");
    });
});

describe('Finding Records', function() {
    test('Find one', async function() {
        let res = await db.findone ('test', {foo: 'findme'});
        expect(res).toHaveProperty('foo', 'findme');
        expect(res).toHaveProperty('bar', 'boo');
    });
});
