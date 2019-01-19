import BlockError = require('./../types/BlockError.js');

const numberSum = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberSum.name',
    name: 'Sum',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberSum.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberSum.B'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberSum.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: inputs.a + inputs.b
        });
    }
};
const numberSubtract = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberSubtract.name',
    name: 'Subtract',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberSubtract.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberSubtract.B'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberSubtract.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: inputs.a - inputs.b
        });
    }
};
const numberMultiply = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberMultiply.name',
    name: 'Multiply',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberMultiply.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberMultiply.B'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberMultiply.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: inputs.a * inputs.b
        });
    }
};
const numberDivide = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberDivide.name',
    name: 'Divide',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberDivide.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberDivide.B'
    }, {
        key: 'error',
        type: 'number',
        name: 'Error',
        optional: true,
        nameLoc: 'blocks.atomicMath.numberDivide.error'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberDivide.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: isFinite(inputs.a / inputs.b)? (inputs.a / inputs.b) : (inputs.error || Infinity)
        });
    }
};
const numberAbs = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberAbs.name',
    name: 'Absolute',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberAbs.A'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberAbs.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: Math.abs(inputs.a)
        });
    }
};
const numberPower = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberPower.name',
    name: 'Power',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberPower.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberPower.B'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberPower.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: Math.pow(inputs.a, inputs.b)
        });
    }
};
const numberModulo = <IBlockTemplate>{
    nameLoc: 'blocks.atomicMath.numberModulo.name',
    name: 'Modulo',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'number',
        name: 'A',
        nameLoc: 'blocks.atomicMath.numberModulo.A'
    }, {
        key: 'modulo',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.atomicMath.numberModulo.B'
    }],
    outputs: [{
        key: 'result',
        type: 'number',
        name: 'Result',
        nameLoc: 'blocks.atomicMath.numberModulo.result'
    }],
    exec(inputs, block) {
        return Promise.resolve({
            result: inputs.a % inputs.modulo
        });
    }
};

module.exports = {
    name: 'Atomic Math',
    blocks: {
        numberSum,
        numberSubtract,
        numberMultiply,
        numberDivide,
        numberAbs,
        numberPower,
        numberModulo
    }
};
