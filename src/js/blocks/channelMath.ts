import BlockError = require('./../types/BlockError.js');
import Channel = require('./../types/Channel.js');

const channelSum = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelSum.name',
    name: 'Sum',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelSum.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelSum.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelSum.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] + inputs.b.data[ind];
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelAddNumber = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelAddNumber.name',
    name: 'Sum with a Number',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelAddNumber.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelAddNumber.B',
        hint: 'Usually in between 0 and 255'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelAddNumber.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] + inputs.b;
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelSubtract = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelSubtract.name',
    name: 'Subtract',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelSubtract.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelSubtract.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelSubtract.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] - inputs.b.data[ind];
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelMultiply = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelMultiply.name',
    name: 'Multiply',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelMultiply.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelMultiply.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelMultiply.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] * inputs.b.data[ind] / 256;
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelMultiplyNumber = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelMultiplyNumber.name',
    name: 'Multiply by a Number',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelMultiplyNumber.A'
    }, {
        key: 'b',
        type: 'number',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelMultiplyNumber.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelMultiplyNumber.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] * inputs.b;
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelDivide = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelDivide.name',
    name: 'Divide',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelDivide.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelDivide.B'
    }, {
        key: 'error',
        type: 'number',
        name: 'Error',
        optional: true,
        nameLoc: 'blocks.channelMath.channelDivide.error'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelDivide.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    const pixel = inputs.a.data[ind] / inputs.b.data[ind] * 256;
                    result.data[ind] = isFinite(pixel)? pixel : (inputs.error || Infinity);
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelAbs = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelAbs.name',
    name: 'Absolute',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelAbs.A'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelAbs.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = Math.abs(inputs.a.data[ind]);
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelPower = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelPower.name',
    name: 'Power',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelPower.A'
    }, {
        key: 'power',
        type: 'number',
        name: 'Power',
        nameLoc: 'blocks.channelMath.channelPower.power'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelPower.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = Math.pow(inputs.a.data[ind], inputs.power);
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelModulo = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelModulo.name',
    name: 'Modulo',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelModulo.A'
    }, {
        key: 'modulo',
        type: 'number',
        name: 'Modulo',
        nameLoc: 'blocks.channelMath.channelModulo.modulo',
        hint: 'Usually a value between (0; 256].'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelModulo.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = inputs.a.data[ind] % inputs.modulo;
                }
            }
            resolve({
                result
            });
        });
    }
};

const channelMax = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelMax.name',
    name: 'Max',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelMax.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelMax.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelMax.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = Math.max(inputs.a.data[ind], inputs.b.data[ind]);
                }
            }
            resolve({
                result
            });
        });
    }
};
const channelMin = <IBlockTemplate>{
    nameLoc: 'blocks.channelMath.channelMin.name',
    name: 'Min',
    noPreview: true,
    inputs: [{
        key: 'a',
        type: 'channel',
        name: 'A',
        nameLoc: 'blocks.channelMath.channelMin.A'
    }, {
        key: 'b',
        type: 'channel',
        name: 'B',
        nameLoc: 'blocks.channelMath.channelMin.B'
    }],
    outputs: [{
        key: 'result',
        type: 'channel',
        name: 'Result',
        nameLoc: 'blocks.channelMath.channelMin.result'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.a.width,
                  h = inputs.a.height;
            const result = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ind = x + y*w;
                    result.data[ind] = Math.min(inputs.a.data[ind], inputs.b.data[ind]);
                }
            }
            resolve({
                result
            });
        });
    }
};

module.exports = {
    name: 'Channel Math',
    blocks: {
        channelSum,
        channelAddNumber,
        channelSubtract,
        channelMultiply,
        channelMultiplyNumber,
        channelDivide,
        channelAbs,
        channelPower,
        channelModulo,
        channelMax,
        channelMin
    }
};
