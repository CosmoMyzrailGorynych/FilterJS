const {gaussianBlur} = require('./blur/gaussianBlur.js');
const {bilateralFilter} = require('./blur/bilateralFilter.js');

module.exports = {
    name: 'Blur',
    blocks: {
        bilateralFilter,
        gaussianBlur
    }
};
