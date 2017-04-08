const nJ = require('normalizeJson');

let validator = nJ({
    name: [String, 30],
    age: [Number, 0, 100],
    color: ['red', 'yellow', 'blue']
});

let obj = {
    name: 'Nigel',
    age: 23,
    color: ' blue  '
};

let result = validator(obj);
console.log(result); // { name: 'Nigel', age: 23, color: 'blue' }

let badObj = {
    name: 'Somebody',
    age: 'not a number',
    color: null,
    extraField: 'should not be here'
};

try {
    let result = validator(badObj);
}
catch (err) {
    console.log(err); // string containing information about failure
}
