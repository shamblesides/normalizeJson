const nJ = require('normalize-json');

// a schema looks like this!
let validator = nJ({
    name: [String, 30], // a string with <= 30 characters
    age: [Number, 0, 100], // a number between 0 and 100, inclusive
    color: ['red', 'yellow', 'blue'] // must be one of these three values
});

// here's how we might validate/normalize an object
let obj = {
    name: ' Nigel   ', // this string will be trimmed!
    age: 23,
    color: 'blue',
    someUndefinedField: undefined // undefined fields will be stripped out
};

let result = validator(obj); // 'result' is a new object; 'obj' has not been changed
console.log(result); // { name: 'Nigel', age: 23, color: 'blue' }

// here's a bad object; this will fail validation
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
    console.log(err.message); // will give the first found error: "age is not a number"
}
