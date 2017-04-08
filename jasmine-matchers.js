const nJ = require('./normalize-json');

module.exports = {
    toFitSchema: () => ({
        compare: (obj, requirements) => {
            try {
                if (typeof requirements === 'function') requirements(obj);
                else nJ(requirements)(obj);
                return {
                    pass: true,
                    message: `Expected ${JSON.stringify(obj) || obj} to fail the spec`
                }
            }
            catch (err) {
                return {
                    pass: false,
                    message: `Expected ${JSON.stringify(obj) || obj} to pass: nJ says "${err}"`
                }
            }
        }
    })
};