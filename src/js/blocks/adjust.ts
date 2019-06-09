const {grayscale, grayscaleChannel} = require('./adjust/grayscale.js');
const {invert} = require('./adjust/invert.js');
const {brightnessContrast} = require('./adjust/brightnessContrast.js');
const {gammaCorrection} = require('./adjust/gammaCorrection.js');

module.exports = {
    name: 'Adjust',
    blocks: {
        invert,
        grayscale,
        grayscaleChannel,
        brightnessContrast,
        gammaCorrection
    }
};
