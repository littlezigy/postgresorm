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
    INSERT INTO test(foo, bar) VALUES('findme', 'boo'), ('foop', 'bloop'), ('foop', 'bloop'), ('foop', 'bloop');

    INSERT INTO test(foo, bar) VALUES('value1', 'value4'), ('value2', 'value5'), ('value1', 'value6'), ('value3', 'value6'), ('value2', 'value3');
    `

    let blah = await db.customquery(query);
    query = `CREATE TABLE test1(
        _id serial primary key,
        boo varchar(20),
        far varchar(20)
    );`
    let blah1 = await db.customquery(query);
});

afterAll(async() => {
    await db.customquery('DROP TABLE test;');
    await db.customquery('DROP TABLE test1;');
});

describe('Create Record in table', function() {
        test('Create record with multiple columns', async function() {
            await expect( db.create('test', ['foo', 'bar'], ['boor', 'peer']) ).resolves.toHaveProperty("foo", "boor");
       });

    test('Create record with multiple columns using object notation', async function() {
         await expect( db.create('test', {foo: 'moor', bar: 'fear'}) ).resolves.toHaveProperty("foo", "moor");
    });
});

describe('Finding Records', function() {
    test('Find one', async function() {
        let res = await db.findone ('test', {foo: 'findme'});
        expect(res).toHaveProperty('foo', 'findme');
        expect(res).toHaveProperty('bar', 'boo');
    });
    describe('List', function() {
        test('List with no conditions', async function() {
            await expect(db.list('test')).resolves.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ foo: 'foop', bar: 'bloop'})
                ])
            );
        });
        test('List with two conditions', async function() {
            await expect(db.list('test', {foo: 'foop', bar: 'bloop'})).resolves.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ foo: 'foop', bar: 'bloop'})
                ])
            );
        });
    });

    test('Find all', async function() {
        await expect(db.findall('test', {foo: ['value1', 'value2', 'value3'], bar: ['value4', 'value5', 'value6']})).resolves.not.toHaveLength(0);
    });
});

describe('Transactions', function() {
    test('Create in two tables', async function() {
        results = await db.transaction(async client => {
            let res = await db.create('test', {foo: 'link up', bar: 'fear'}, null, client);
            let res1 = await db.create('test1', {boo: 'transaction', far: 'fear'}, null, client);
            // console.log('RES', res);
            // console.log('RES1', res);
        });
        await expect(db.findall('test', {foo: ['link up']})).resolves.not.toHaveLength(0);
        await expect(db.findall('test1', {boo: ['transaction']})).resolves.not.toHaveLength(0);
    });
});
