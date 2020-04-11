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
    query = `CREATE TABLE test1(
        _id serial primary key,
        boo varchar(20),
        far varchar(20)
    );`
    let blah1 = await db.customquery(query);
    console.log("BLAH", blah);
    console.log("BLAH1", blah1);
});

afterAll(async() => {
//    await db.customquery('DROP TABLE test;');
//    await db.customquery('DROP TABLE test1;');
});

describe('Create Record in table', function() {
        test('Create record with multiple columns', async function() {
        let res = await db.create('test', ['foo', 'bar'], ['boor', 'peer']);
        expect(res).toHaveProperty("foo", "boor"); });
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

describe('Transactions', function() {
    test('Create in two tables', async function() {
        results = await db.transaction(async client => {
            let res = await db.create('test', {foo: 'link up', bar: 'fear'}, null, client);
            let res1 = await db.create('test1', {boo: 'transaction', far: 'fear'}, null, client);
            console.log('RES', res);
            console.log('RES1', res);
        });
        console.log('RESULTS', results);
    });
});
