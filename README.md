[![NPM](https://nodei.co/npm/normalize-json.png?compact=true)](https://nodei.co/npm/normalize-json/)

[![Try normalize-json on RunKit](https://badge.runkitcdn.com/normalize-json.svg)](https://npm.runkit.com/normalize-json)

# normalize-json
Terse syntax for validating and normalizing JavaScript objects in Node.

``` js
const nJ = require('normalize-json');

// a validator looks like this!
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

let normalizedObj = validator(obj); // 'normalizedObj' is a new object; 'obj' has not been changed
console.log(normalizedObj); // { name: 'Nigel', age: 23, color: 'blue' }
```

## Try it out!
You can try out normalize-json in your browser at [npm.runkit.com/normalize-json](https://npm.runkit.com/normalize-json).


## How to use
To validate an object, first define a validator for that type of object. This is done by passing an object into the `nJ` function. The keys of that object will be the names of the expected fields, and the values should be array literals with information on the expected ata.


### Strings
``` js
let nameValidator = nJ({
    first: [ String ],
    last: [ String ]
});
```

After the validation process, strings will automatically be trimmed in the `result` object.
``` js
let name = { first: 'Don', last: 'Quixote    ' }
let normalizedName = nameValidator(name);
console.log(normalizedName.last); // 'Quixote'
```

If you only want to allow strings up to a certain length, use:
``` js
let tweetValidator = nJ({
    tweetBody: [ String, 140 ]
});
```


### Numbers
``` js
let rotationValidator = nJ({
    degrees: [ Number, 0, 360 ] // minimum and maximum
});
```

If the minimum is 0, it can be omitted:
``` js
let rotationValidator = nJ({
    degrees: [ Number, 360 ] // minimum and maximum
});
```

If there's no upper or lower bound to validate, you can either specify `-Infinity` and `Infinity`, or just leave them out entirely.


### Integers
Similar to Numbers:
``` js
let colorValidator = nJ({
    red: [ Number.isInteger, 0, 255 ],
    green: [ Number.isInteger, 0, 255 ],
    blue: [ Number.isInteger, 0, 255 ]
});
```


### Enumerations
``` js
let moodValidator = nJ({
    mood: [ 'happy', 'sad', 'excited', 'scared' ]
});
```
Simply pass all allowed values as an array. Works with strings, numbers, booleans, or a mix of the three.


### Regular Expressions
``` js
let phoneNumberValidator = nJ({
    areaCode: [ /\(\d{3}\)/ ],
    number: [ /\d{3}-\d{4}/ ]
});
```
Simply pass the regular expression literal in an array.
