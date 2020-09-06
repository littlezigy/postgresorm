let { Pool } = require('pg');
let query = jest.spyOn(Pool.prototype, 'query');
const db = require('../database');

beforeAll( function() {
    console.log('EFORE ALL');
    db.initializeDatabase({
        connectionString: `postgresql://${process.env.PGORM_USER}:${process.env.PGORM_PASSWORD}@${process.env.PGORM_HOST}:${process.env.PGORM_PORT}/pgorm_dev_db`
    });

    db.debug(false);
    let query = `
        CREATE TABLE test(
            _id serial primary key,
            foo text,
            bar varchar(20),
            bum varchar(20)
        );
        CREATE TABLE test_jsonb(
            _id serial primary key,
            foo jsonb,
            bar varchar(20),
            bum varchar(20)
        );
        CREATE TABLE test_with_id_column(
            _id serial primary key
        );
        CREATE TABLE test1(
            _id serial primary key,
            boo varchar(20),
            far varchar(20)
        );
        CREATE TABLE orders(
            _id integer NOT NULL primary key,
            status varchar(30),
            email text,
            subtotal int,
            start_time timestamp with time zone,
            end_time timestamp with time zone,
            vat integer,
            total integer
        );

    `;
    return db.customquery('DROP TABLE IF EXISTS test, orders, test_jsonb, test1, test_with_id_column;')
    .then(() => db.customquery(query))
    .catch(e => {
        console.log('ERRORRROR', e);
    });
});

beforeEach( function() {
    console.log('WIPING TABLE');
    db.debug(false);
    let query = `
        INSERT INTO test(foo, bar) VALUES('findme', 'boo'), ('foop', 'bloop'), ('foop', 'bloop'), ('foop', 'bloop');

        INSERT INTO test(foo, bar) VALUES('test update', 'boo'), ('test update', 'bloop'), ('test update 2', 'bloop'), ('test update 3', 'bloop');
        INSERT INTO test(foo, bar, bum) VALUES('test update 2', 'bloop', 'gram'), ('test update 3', 'bloop', 'book');

        INSERT INTO test(foo, bar) VALUES('value1', 'value4'), ('value2', 'value5'), ('value1', 'value6'), ('value3', 'value6'), ('value2', 'value3');
    `;

    return db.customquery('TRUNCATE TABLE test, test_jsonb, orders, test1, test_with_id_column;')
    .then(() => db.customquery(query))
    .catch(e => {
        console.log('ERRORRROR', e);
    });
});

    /*
afterAll(async() => {
    await db.customquery('DROP TABLE test, test1, test_with_id_column;');
});
    */

describe('Create Record in table', function() {
    test('Create record with no values', function() {
        return expect( db.create('test_with_id_column') ).resolves.toHaveProperty('_id');
    });

    test('Create record with multiple columns', function() {
        return expect( db.create('test', ['foo', 'bar'], ['boor', 'peer']) ).resolves.toHaveProperty("foo", "boor");
    });

    test('Create multiple records', function() {
        return expect( db.create('test', [
            {'foo': 'kronk', 'bar': 'reeee'}, {'foo': 'boor', 'bar': 'peer'},
            {'foo': 'bork', 'bar': 'pere'}, {'foo': 'boro', 'bar': 'eper'},
            {'foo': 'robo', 'bar': 'pree'}, {'foo': 'obor', 'bar': 'rpee'}
        ]) ).resolves.toEqual([
            expect.objectContaining({'foo': 'kronk', 'bar': 'reeee'}), expect.objectContaining({'foo': 'boor', 'bar': 'peer'}),
            expect.objectContaining({'foo': 'bork', 'bar': 'pere'}), expect.objectContaining({'foo': 'boro', 'bar': 'eper'}),
            expect.objectContaining({'foo': 'robo', 'bar': 'pree'}), expect.objectContaining({'foo': 'obor', 'bar': 'rpee'})
        ]);
    });

    test('Create record with multiple columns using object notation', function() {
         return  expect( db.create('test', {foo: 'moor', bar: 'fear'}) ).resolves.toHaveProperty("foo", "moor");
    });
    test('Create record with multiple columns and columns are inconsistent', function() {
        db.debug(true);
        let orders = [
            { _id: 123, status: 'pending', email: 'email@sampleuser.com', subtotal: 5000, total: 10000, start_time: '2020-12-29T21:24:25.916Z', end_time: '2020-12-29T21:24:25.916Z', vat: 5 },
            { _id: 456, status: 'pending', email: 'email@sampleuser.com', subtotal: 5000, total: 10000, start_time: '2020-12-29T21:24:25.916Z', end_time: '2020-12-29T21:24:25.916Z', vat: 5 },
            { _id: 789, status: 'pending', email: 'email@sampleuser.com', subtotal: 5000, total: 10000, start_time: '2020-12-29T21:24:25.916Z', end_time: '2020-12-29T21:24:25.916Z', vat: 5 }
        ]

        return expect( db.create('orders', orders) ).resolves.toEqual(orders);
    });

    test('Create record with json object columns', function() {
        return expect( db.create('test_jsonb', {foo: {moon: 'moor', pie: 'boon'}, bar: 'fear'}) ).resolves.toEqual(
            expect.objectContaining( {foo: {moon: 'moor', pie: 'boon'}, bar: 'fear'})
        );
    });
});

describe('Update Records', function() {
    test('Set one column', async function() {
        db.debug(false);
        return db.findone('test', {foo: 'test update'})
        .then(async res => {
            console.log('RESSSSS', res);
            await expect(
                db.update('test', {foo: 'test update'}, {bar: 'Update Worked'})
            ).resolves.toEqual( expect.arrayContaining([
                expect.objectContaining({ foo: 'test update', bar: 'Update Worked' })
            ]));
            
            await expect(
                db.list('test', {foo: 'test update'})
            ).resolves.toEqual( expect.arrayContaining([
                expect.objectContaining({ foo: 'test update', bar: 'Update Worked' })
            ]));
        });
    });

    test('Set multiple columns', function() {
        return db.findone('test', {foo: 'test update 3'})
        .then(async res => {
            console.log('RESSS', res);
            await expect(
                db.update('test', {foo: 'test update 3'}, {bar: 'Updating...', bum: 'Fixed'})
            ).resolves.toEqual( expect.arrayContaining([
                expect.objectContaining({foo: 'test update 3', bar: 'Updating...', bum: 'Fixed'})
            ]))

            await expect(
                db.list('test', {foo: 'test update 3'})
            ).resolves.toEqual( expect.arrayContaining([
                expect.objectContaining({foo: 'test update 3', bar: 'Updating...', bum: 'Fixed'})
            ]))
        });
    });
});

describe('Finding Records', function() {
    db.debug(false);
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
    db.debug(false);
    test('Create in two tables', async function() {
        results = await db.transaction(async client => {
            let res = await db.create('test', {foo: 'link up', bar: 'fear'}, null, client);
            let res1 = await db.create('test1', {boo: 'transaction', far: 'fear'}, null, client);
        });
        await expect(db.findall('test', {foo: ['link up']})).resolves.not.toHaveLength(0);
        await expect(db.findall('test1', {boo: ['transaction']})).resolves.not.toHaveLength(0);
    });
});
