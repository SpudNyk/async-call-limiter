const { debounce, combineArguments } = require('../dist');
const data = {
    1: 'data 1',
    2: 'data 2'
    //...
};

// this could be fetching from a database or webservice
// debounce supports async functions or returned promises
const getByIds = ids => {
    console.log(`Getting: ${JSON.stringify(ids)}`);
    const keyed = {};
    // this could be a server request
    for (const id of ids) {
        keyed[id] = data[id];
    }
    return keyed;
};

// data loader equivalent
const load = debounce(getByIds, 0, { reducer: combineArguments });
const loadData = async id => {
    const data = await load(id);
    return data[id];
};

const main = async () => {
    const foo = loadData(2);
    const bar = loadData(1);
    const baz = loadData(3);
    console.log(`Foo: ${await foo}`);
    console.log(`Bar: ${await bar}`);
    console.log(`Baz: ${await baz}`);
};

main();

// Outputs:
// Getting: [2,1,3]
// Foo: data 2
// Bar: data 1
// Baz: undefined
