const glob = require('./../global.js');
const mask = <IBlockTemplate>{
    nameLoc: 'blocks.composing.mask.name',
    name: 'Mask',
    noPreview: true,
    inputs: [{
        key: 'bottom',
        type: 'canvas',
        name: 'Source',
        nameLoc: 'blocks.composing.mask.inputSource'
    }, {
        key: 'top',
        type: 'canvas',
        name: 'Destination',
        nameLoc: 'blocks.composing.mask.inputDestination'
    }],
    outputs: [{
        key: 'result',
        type: 'canvas',
        name: 'Result',
        nameLoc: 'blocks.composing.blend.outputResult'
    }],
    tags: [{
        tag: 'select-input',
        key: 'mode',
        defaultValue: 'source-in',
        options: [
            'source-over',
            'source-in',
            'source-out',
            'source-atop',
            'destination-over',
            'destination-in',
            'destination-out',
            'destination-atop',
            'xor'
        ]
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;

            const cx = canvas.getContext('2d');
            cx.drawImage(inputs.bottom, 0, 0);
            cx.globalCompositeOperation = block.tagValues.mode;
            cx.drawImage(inputs.top, 0, 0);
            resolve({
                result: canvas
            });
        });
    }
};

const blend = <IBlockTemplate>{
    nameLoc: 'blocks.composing.blend.name',
    name: 'Blend',
    noPreview: true,
    inputs: [{
        key: 'bottom',
        type: 'canvas',
        name: 'Bottom Image',
        nameLoc: 'blocks.composing.blend.inputBottom'
    }, {
        key: 'top',
        type: 'canvas',
        name: 'Top Image',
        nameLoc: 'blocks.composing.blend.inputTop'
    }, {
        key: 'opacity',
        type: 'number',
        name: 'Opacity',
        optional: true,
        hint: '0-1, default is 1 (full opacity)',
        nameLoc: 'blocks.composing.blend.inputOpacity'
    }],
    outputs: [{
        key: 'result',
        type: 'canvas',
        name: 'Result',
        nameLoc: 'blocks.composing.blend.outputResult'
    }],
    tags: [{
        tag: 'select-input',
        key: 'mode',
        defaultValue: 'source-over',
        options: [
            'source-over',
            'lighter',
            'lighten',
            'multiply',
            'color-burn',
            'darken',
            'screen',
            'color-dodge',
            'overlay',
            'soft-light',
            'hard-light',
            'difference',
            'exclusion',
            'hue',
            'saturation',
            'color',
            'luminosity'
        ]
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;

            const cx = canvas.getContext('2d');
            cx.drawImage(inputs.bottom, 0, 0);
            cx.globalAlpha = ('opacity' in inputs)? inputs.opacity : 1;
            cx.globalCompositeOperation = block.tagValues.mode;
            cx.drawImage(inputs.top, 0, 0);
            resolve({
                result: canvas
            });
        });
    }
};

const {unblur} = require('./composing/unblur.js');

module.exports = {
    name: 'Composing',
    blocks: {
        blend,
        mask,
        unblur
    }
};
