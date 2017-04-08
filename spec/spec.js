/* global describe it expect */
const nJ = require('../normalize-json');

describe("normalize-json", () => {
    beforeEach(() => jasmine.addMatchers(nJ.jasmineMatchers));

    it('should reject non-objects', () => {
        let nonObjects = [undefined, null, 0, 1, true, false, 'just a string', '', [], function(){}];
        let schema = nJ({ 'field': [String] });

        for (obj of nonObjects) {
            expect(() => schema(obj)).toThrowError();
        }
    })

    it('should require all fields', () => {
        let schema = nJ({
            'first': [ String ],
            'second': [ {$optional:String} ]
        });
        expect(schema({'first': 'here'})).toEqual({'first': 'here'});
        expect(schema({'first': 'here', 'second': 'here'})).toEqual({'first': 'here', 'second': 'here'});

        expect(() => schema({})).toThrowError();
        expect(() => schema({'second': 'here'})).toThrowError();
    });

    it('should strip undefined values from fields not in the schema', () => {
        let schema = nJ({ first: [ String ] });

        let obj = { first: 'should be here', second: undefined };
        expect(obj).not.toEqual({ first: 'should be here' });
        expect(obj.hasOwnProperty('second')).toBe(true);

        let out = schema(obj);
        expect(out).toEqual({ first: 'should be here' });
        expect(out.hasOwnProperty('second')).toBe(false);
    });

    it('should strip undefined values from $optional fields', () => {
        let schema = nJ({
            first: [ String ],
            second: [ {$optional:String} ]
        });

        let obj = { first: 'should be here', second: undefined };
        expect(obj).not.toEqual({ first: 'should be here' });
        expect(obj.hasOwnProperty('second')).toBe(true);

        let out = schema(obj);
        expect(out).toEqual({ first: 'should be here' });
        expect(out.hasOwnProperty('second')).toBe(false);
    });

    it('should strip undefined values from fields resolved as undefined', () => {
        let schema = nJ({
            first: [ String ],
            second: () => undefined
        });

        let obj = { first: 'should be here', second: undefined };
        expect(obj).not.toEqual({ first: 'should be here' });
        expect(obj.hasOwnProperty('second')).toBe(true);

        let out = schema(obj);
        expect(out).toEqual({ first: 'should be here' });
        expect(out.hasOwnProperty('second')).toBe(false);
    });

    it('should reject unexpected fields', () => {
        expect({'good': 'present', 'extra': 'also here'}).not.toFitSchema({ 'good': [ String ] });
    });

    it('should validate strings', () => {
        let schema = nJ({ 'str': [ String ] });

        expect({'str': 'hello'}).toFitSchema(schema);
        expect({'str': 'a'}).toFitSchema(schema);
        expect({'str': 'undefined'}).toFitSchema(schema);
        expect({'str': 'null'}).toFitSchema(schema);
        expect({'str': 'true'}).toFitSchema(schema);
        expect({'str': 'false'}).toFitSchema(schema);
        expect({'str': '0'}).toFitSchema(schema);
        expect({'str': '1'}).toFitSchema(schema);
        expect({'str': 'unicode ♥'}).toFitSchema(schema);
        expect({'str': '©️©️©️©️©️'}).toFitSchema(schema);
        expect({'str': '😂😂😂😂😂'}).toFitSchema(schema);
        expect({'str': 'zal͞g͡o t̷ęx͜t'}).toFitSchema(schema);

        expect({'str': ''}).not.toFitSchema(schema);
        expect({'str': undefined}).not.toFitSchema(schema);
        expect({'str': null}).not.toFitSchema(schema);
        expect({'str': true}).not.toFitSchema(schema);
        expect({'str': false}).not.toFitSchema(schema);
        expect({'str': 0}).not.toFitSchema(schema);
        expect({'str': 1}).not.toFitSchema(schema);
        expect({'str': 999}).not.toFitSchema(schema);
        expect({'str': 9.9}).not.toFitSchema(schema);
        expect({'str': [] }).not.toFitSchema(schema);
        expect({'str': {} }).not.toFitSchema(schema);
        expect({'str': function(){} }).not.toFitSchema(schema);
    });

    it('should validate strings with a maximum length', () => {
        let schema = nJ({ 'str': [ String, 10 ] });

        expect({'str': 'hello'}).toFitSchema(schema);
        expect({'str': 'a'}).toFitSchema(schema);
        expect({'str': '10 letters'}).toFitSchema(schema);
        expect({'str': 'unicode ♥'}).toFitSchema(schema);
        expect({'str': '♥♥♥♥♥'}).toFitSchema(schema);
        expect({'str': '©️©️©️©️©️'}).toFitSchema(schema);
        expect({'str': '😂😂😂😂😂'}).toFitSchema(schema);

        expect({'str': ''}).not.toFitSchema(schema);
        expect({'str': undefined}).not.toFitSchema(schema);
        expect({'str': null}).not.toFitSchema(schema);
        expect({'str': 'elevenchars'}).not.toFitSchema(schema);
        expect({'str': 'unicode✖️✖️'}).not.toFitSchema(schema);
        expect({'str': Array(100).join('VERYLONG') }).not.toFitSchema(schema);
    });

    it('should validate Optional strings too', () => {
        let schema = nJ({ 'str': [ {$optional:String}, 10 ] });

        expect({'str': 'hello'}).toFitSchema(schema);
        expect({'str': 'a string'}).toFitSchema(schema)
        expect({'str': undefined}).toFitSchema(schema)
        expect({'str': ''}).toFitSchema(schema)
        expect({'str': 'null'}).toFitSchema(schema)
        expect({'str': '0'}).toFitSchema(schema)
        expect({'str': 'false'}).toFitSchema(schema)

        expect({'str': null}).not.toFitSchema(schema)
        expect({'str': 0}).not.toFitSchema(schema)
        expect({'str': false}).not.toFitSchema(schema)
        expect({'str': []}).not.toFitSchema(schema)
        expect({'str': {}}).not.toFitSchema(schema)
        expect({'str': 'still too long'}).not.toFitSchema(schema)
    });

    it('should automatically trim strings', () => {
        let schema = nJ({ 'str': [ String ] });

        expect(schema({str: 'hello '}).str).not.toBe('hello ');
        expect(schema({str: 'hello '}).str).toBe('hello');

        expect({str: '   '}).not.toFitSchema(schema);
    });

    it('should not modify the source objects', () => {
        let schema = nJ({ 'str': [ String ] });

        let obj = {str: ' hello ', extraField: undefined};
        expect(obj.hasOwnProperty('extraField')).toBe(true);
        expect(obj.str).toEqual(' hello ');
        expect(obj.str).not.toEqual('hello');

        schema(obj);
        expect(obj.hasOwnProperty('extraField')).toBe(true);
        expect(obj.str).toEqual(' hello ');
        expect(obj.str).not.toEqual('hello');
    });

    it('should validate numbers', () => {
        let schema = nJ({ 'num': [ Number ] });

        expect({'num': 0}).toFitSchema(schema)
        expect({'num': 1}).toFitSchema(schema)
        expect({'num': 0.00001}).toFitSchema(schema)
        expect({'num': 9999999999}).toFitSchema(schema)
        expect({'num': -1}).toFitSchema(schema)

        expect({'num': Infinity}).not.toFitSchema(schema)
        expect({'num': -Infinity}).not.toFitSchema(schema)
        expect({'num': NaN}).not.toFitSchema(schema)
        expect({'num': '0'}).not.toFitSchema(schema)
        expect({'num': '1'}).not.toFitSchema(schema)
        expect({'num': true}).not.toFitSchema(schema)
        expect({'num': false}).not.toFitSchema(schema)
        expect({'num': undefined}).not.toFitSchema(schema)
        expect({'num': null}).not.toFitSchema(schema)
        expect({'num': []}).not.toFitSchema(schema)
        expect({'num': {}}).not.toFitSchema(schema)
        expect({'num': function(){} }).not.toFitSchema(schema)
    });

    it('should validate integers', () => {
        let schema = nJ({ 'num': [ Number.isInteger ] });

        expect({'num': 0}).toFitSchema(schema)
        expect({'num': 1}).toFitSchema(schema)
        expect({'num': -1}).toFitSchema(schema)
        expect({'num': Math.pow(2,31)-1}).toFitSchema(schema)
        expect({'num': -Math.pow(2,31)}).toFitSchema(schema)

        expect({'num': 0.1}).not.toFitSchema(schema)
        expect({'num': -0.1}).not.toFitSchema(schema)
        expect({'num': 400.5}).not.toFitSchema(schema)
        expect({'num': Infinity}).not.toFitSchema(schema)
        expect({'num': -Infinity}).not.toFitSchema(schema)
        expect({'num': NaN}).not.toFitSchema(schema)
        expect({'num': '0'}).not.toFitSchema(schema)
        expect({'num': '1'}).not.toFitSchema(schema)
        expect({'num': true}).not.toFitSchema(schema)
        expect({'num': false}).not.toFitSchema(schema)
        expect({'num': undefined}).not.toFitSchema(schema)
        expect({'num': null}).not.toFitSchema(schema)
        expect({'num': []}).not.toFitSchema(schema)
        expect({'num': {}}).not.toFitSchema(schema)
        expect({'num': function(){}}).not.toFitSchema(schema)
    });

    it('should validate maximums', () => {
        let schema = nJ({ 'num': [ Number, 10] });

        expect({'num': 0}).toFitSchema(schema)
        expect({'num': 1}).toFitSchema(schema)
        expect({'num': 9}).toFitSchema(schema)
        expect({'num': 9.99999}).toFitSchema(schema)
        expect({'num': 10}).toFitSchema(schema)

        expect({'num': -1}).not.toFitSchema(schema)
        expect({'num': -0.0001}).not.toFitSchema(schema)
        expect({'num': 10.0001}).not.toFitSchema(schema)
        expect({'num': 11}).not.toFitSchema(schema)
    });

    it('should validate minimums/maximums', () => {
        let schema = nJ({ 'num': [ Number, -12, -3] });

        expect({'num': -12}).toFitSchema(schema)
        expect({'num': -11.9999}).toFitSchema(schema)
        expect({'num': -11}).toFitSchema(schema)
        expect({'num': -4}).toFitSchema(schema)
        expect({'num': -3.0001}).toFitSchema(schema)
        expect({'num': -3}).toFitSchema(schema)

        expect({'num': -13}).not.toFitSchema(schema)
        expect({'num': -12.0001}).not.toFitSchema(schema)
        expect({'num': -2.9999}).not.toFitSchema(schema)
        expect({'num': -2}).not.toFitSchema(schema)
        expect({'num': 1}).not.toFitSchema(schema)
        expect({'num': 0}).not.toFitSchema(schema)
        expect({'num': -1}).not.toFitSchema(schema)
        expect({'num': 12}).not.toFitSchema(schema)
        expect({'num': 3}).not.toFitSchema(schema)
    });

    it('should validate string enumerations', () => {
        let schema = nJ({
            'someEnum': [ 'string', '0', 'false', '', 'null', 'undefined' ]
        });

        expect({'someEnum': 'string'}).toFitSchema(schema)
        expect({'someEnum': '0'}).toFitSchema(schema)
        expect({'someEnum': 'false'}).toFitSchema(schema)
        expect({'someEnum': ''}).toFitSchema(schema)
        expect({'someEnum': 'null'}).toFitSchema(schema)
        expect({'someEnum': 'undefined'}).toFitSchema(schema)

        expect({'someEnum': 'stringgg'}).not.toFitSchema(schema)
        expect({'someEnum': 'String'}).not.toFitSchema(schema)
        expect({'someEnum': 0}).not.toFitSchema(schema)
        expect({'someEnum': false}).not.toFitSchema(schema)
        expect({'someEnum': null}).not.toFitSchema(schema)
        expect({'someEnum': undefined}).not.toFitSchema(schema)
        expect({'someEnum': []}).not.toFitSchema(schema)
        expect({'someEnum': {}}).not.toFitSchema(schema)
    });

    it('should validate numerical enumerations', () => {
        let schema = nJ({
            'someEnum': [0, 2, -4]
        });

        expect({'someEnum': 0}).toFitSchema(schema);
        expect({'someEnum': 2}).toFitSchema(schema);
        expect({'someEnum': -4}).toFitSchema(schema);

        expect({'someEnum': false}).not.toFitSchema(schema)
        expect({'someEnum': null}).not.toFitSchema(schema)
        expect({'someEnum': undefined}).not.toFitSchema(schema)
        expect({'someEnum': []}).not.toFitSchema(schema)
        expect({'someEnum': {}}).not.toFitSchema(schema)
        expect({'someEnum': '0'}).not.toFitSchema(schema)
        expect({'someEnum': '2'}).not.toFitSchema(schema)
        expect({'someEnum': '-4'}).not.toFitSchema(schema)
        expect({'someEnum': 4}).not.toFitSchema(schema)
    });

    it('should validate mixed enumerations', () => {
        let schema = nJ({
            'someEnum': [7, '9', true, 'false']
        });

        expect({'someEnum': 7}).toFitSchema(schema);
        expect({'someEnum': '9'}).toFitSchema(schema);
        expect({'someEnum': true}).toFitSchema(schema);
        expect({'someEnum': 'false'}).toFitSchema(schema);

        expect({'someEnum': [7] }).not.toFitSchema(schema)
        expect({'someEnum': [7,'9',true,'false',undefined] }).not.toFitSchema(schema)
        expect({'someEnum': '7'}).not.toFitSchema(schema)
        expect({'someEnum': 9}).not.toFitSchema(schema)
        expect({'someEnum': 'true'}).not.toFitSchema(schema)
        expect({'someEnum': false}).not.toFitSchema(schema)
        expect({'someEnum': null}).not.toFitSchema(schema)
        expect({'someEnum': NaN}).not.toFitSchema(schema)
        expect({'someEnum': undefined}).not.toFitSchema(schema);
        expect({'someEnum': 'undefined'}).not.toFitSchema(schema)
        expect({ }).not.toFitSchema(schema);
    });

    it('should validate regular expressions', () => {
        let schema = nJ({
            'field': [ /^a*$/g ]
        });

        expect({'field': ''}).toFitSchema(schema)
        expect({'field': 'a'}).toFitSchema(schema)
        expect({'field': 'aaa'}).toFitSchema(schema)
        
        expect({'field': 'b'}).not.toFitSchema(schema)
        expect({'field': undefined}).not.toFitSchema(schema)
        expect({'field': null}).not.toFitSchema(schema)
        expect({'field': 0}).not.toFitSchema(schema)
        expect({'field': 1}).not.toFitSchema(schema)
        expect({'field': true}).not.toFitSchema(schema)
        expect({'field': false}).not.toFitSchema(schema)
        expect({'field': []}).not.toFitSchema(schema)
        expect({'field': {}}).not.toFitSchema(schema)
    });

    it('should validate functions', () => {
        let schema = nJ({
            'state': ['full', 'empty'],
            'contents': (obj)=> obj.state === 'full' ? [String,10] : undefined
        });

        expect({state:'empty'}).toFitSchema(schema)
        expect({state:'full', contents:'water'}).toFitSchema(schema)

        expect({state:'empty', contents:'stuff'}).not.toFitSchema(schema)
        expect({state:'full'}).not.toFitSchema(schema)
    });

    it('should validate arrays', () => {
        let schema = nJ({
            'words': [Array, String, 10]
        });

        expect({words:[]}).toFitSchema(schema)
        expect({words:['hi']}).toFitSchema(schema)
        expect({words:['hi','hello']}).toFitSchema(schema)
    
        expect({ }).not.toFitSchema(schema);
        expect({words:['too long first one'] }).not.toFitSchema(schema);
        expect({words:['fine', 'ok', 'this one is not good']}).not.toFitSchema(schema);
        expect({words:['hello', undefined, 'error']}).not.toFitSchema(schema);
        expect({words:[9]}).not.toFitSchema(schema);
        expect({words:[['too Nested']]}).not.toFitSchema(schema);
    });

    it('should validate inner schemas', () => {
        let schema = nJ({
            'name': {
                'first': [String, 30],
                'last': [String, 30]
            }
        });

        expect({name:{first:'John',last:'Doe'}} ).toFitSchema(schema)

        expect({name:{}}).not.toFitSchema(schema)
        expect({name:[]}).not.toFitSchema(schema)
        expect({name:{first:'John'}}).not.toFitSchema(schema)
        expect({first:'John', last:'Doe'}).not.toFitSchema(schema)
        expect({name:{first:'John',last:'Doe',extraField:'Hello'}}).not.toFitSchema(schema)

        let obj = {name:{first:'John',last:'Doe',extraField:undefined}};
        expect(obj).not.toEqual({ name:{first:'John',last:'Doe'} });
        expect(obj.name.hasOwnProperty('extraField')).toBe(true);

        let out = schema(obj);
        expect(out).toEqual({ name:{first:'John',last:'Doe'} });
        expect(out.name.hasOwnProperty('extraField')).toBe(false);
    });

    it('should expose the "requirements" field to access the original schema object', () => {
        let nameSchema = nJ({
            'first': [String, 30],
            'last': [String, 30]
        });
        let personSchema = nJ({
            'name': nameSchema.requirements,
            'id': [String]
        });

        expect({name:{first:'John',last:'Doe'}, id:'123'}).toFitSchema(personSchema);
    })

    it('should validate functions within inner schemas', () => {
        let numberSchema = nJ({
            'type': ['positive', 'negative'],
            'number': (num) => ((num.type === 'negative') ? [Number, -Infinity, 0] : [Number, 0, Infinity])
        });
        
        expect({'type':'positive','number':5}).toFitSchema(numberSchema);
        expect({'type':'positive','number':-5}).not.toFitSchema(numberSchema);
        expect({'type':'negative','number':-5}).toFitSchema(numberSchema);
        expect({'type':'negative','number':5}).not.toFitSchema(numberSchema);

        let outerSchema = nJ({
            'inner': numberSchema.requirements
        });

        expect({inner:{'type':'positive','number':5}}).toFitSchema(outerSchema);
        expect({inner:{'type':'positive','number':-5}}).not.toFitSchema(outerSchema);
        expect({inner:{'type':'negative','number':-5}}).toFitSchema(outerSchema);
        expect({inner:{'type':'negative','number':5}}).not.toFitSchema(outerSchema);
    });

    it('should validate functions within objects of an array', () => {
        let numberSchema = nJ({
            'type': ['positive', 'negative'],
            'number': (num) => ((num.type === 'negative') ? [Number, -Infinity, 0] : [Number, 0, Infinity])
        });
        
        expect({'type':'positive','number':5}).toFitSchema(numberSchema);
        expect({'type':'positive','number':-5}).not.toFitSchema(numberSchema);
        expect({'type':'negative','number':-5}).toFitSchema(numberSchema);
        expect({'type':'negative','number':5}).not.toFitSchema(numberSchema);

        let numberArraySchema = nJ({
            'list': [Array, numberSchema.requirements]
        });

        expect({list:[
            {'type':'positive','number':5}, {'type':'negative', 'number':-5}
        ]}).toFitSchema(numberArraySchema);
        expect({list:[
            {'type':'positive','number':5}, {'type':'positive', 'number':-5}
        ]}).not.toFitSchema(numberArraySchema);
    });
});