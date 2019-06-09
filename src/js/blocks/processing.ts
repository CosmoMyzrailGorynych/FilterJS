const {computeNormals, computeNormalsPixels} = require('./processing/normals.js');
const {getSkinColors} = require('./processing/skinColors.js');
const {derivative, applyDerivative, combineDerivatives} = require('./processing/derivative.js');
const median = require('./processing/medianBlock.js').medianBlock;
const {nearestNeighbor} = require('./processing/nearestNeighbor.js');
const {FXAA} = require('./processing/FXAA.js');
const {simpleShader} = require('./processing/shaders.js');

module.exports = {
    name: 'Processing',
    blocks: {
        getSkinColors,
        median,
        nearestNeighbor,
        computeNormals,
        simpleShader,
        derivative,
        applyDerivative,
        combineDerivatives
    }
};
