const {unblur} = require('./sharpen/unblur.js');
const {adaptiveSharpen} = require('./sharpen/adaptiveSharpen.js');
const {fastSharpen} = require('./sharpen/fastSharpen.js');
const {walkingKnife} = require('./sharpen/walkingKnife.js');
const {gradientKnife} = require('./sharpen/gradientKnife.js');

module.exports = {
    name: 'Sharpening',
    blocks: {
        unblur,
        adaptiveSharpen,
        fastSharpen,
        walkingKnife,
        gradientKnife
    }
};
