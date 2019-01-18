import glob = require('./../global.js');

const fillColor = <IBlockTemplate>{
    nameLoc: 'blocks.generators.fillColor.name',
    name: 'Color Fill',
    noPreview: true,
    inputs: [{
        key: 'color',
        type: 'color',
        name: 'Color',
        nameLoc: 'blocks.generators.fillColor.inputColor'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.generators.fillColor.outputImage'
    }],
    exec(inputs) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;
            const cx = canvas.getContext('2d');
            cx.fillStyle = inputs.color;
            cx.fillRect(0, 0, glob.width, glob.height);
            resolve({
                image: canvas
            });
        });
    }
};

const gradientFill = <IBlockTemplate>{
    nameLoc: 'blocks.generators.gradientFill.name',
    name: 'Gradient Fill',
    noPreview: true,
    inputs: [{
        key: 'color1',
        type: 'color',
        name: 'Color 1',
        nameLoc: 'blocks.generators.gradientFill.inputColor1'
    }, {
        key: 'color2',
        type: 'color',
        name: 'Color 2',
        nameLoc: 'blocks.generators.gradientFill.inputColor2',
        optional: true,
    }, {
        key: 'color3',
        type: 'color',
        name: 'Color 3',
        nameLoc: 'blocks.generators.gradientFill.inputColor3',
        optional: true,
    }, {
        key: 'color4',
        type: 'color',
        name: 'Color 4',
        nameLoc: 'blocks.generators.gradientFill.inputColor4',
        optional: true,
    }, {
        key: 'color5',
        type: 'color',
        name: 'Color 5',
        nameLoc: 'blocks.generators.gradientFill.inputColor5'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.generators.gradientFill.outputImage'
    }],
    tags: [{
        tag: 'bool-input',
        key: 'rotate',
        label: 'Rotate',
        defaultValue: false
    }, {
        tag: 'bool-input',
        key: 'radial',
        label: 'Radial',
        defaultValue: false
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas'),
                  w = glob.width,
                  h = glob.height;
            canvas.width = w;
            canvas.height = h;
            const cx = canvas.getContext('2d');
            var grd;
            if (block.tagValues.radial) {
                grd = cx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.min(w/2, h/2));
            } else {
                grd = cx.createLinearGradient(0, 0,
                    block.tagValues.rotate? w : 0,
                    block.tagValues.rotate? 0 : h
                );
            }
            const colorStops = [inputs.color1, inputs.color2, inputs.color3, inputs.color4, inputs.color5]
                  .filter(color => color);
            if (block.tagValues.radial && block.tagValues.rotate) {
                colorStops.reverse();
            }
            for (let i = 0; i < colorStops.length; i++) {
                grd.addColorStop(i / (colorStops.length - 1), colorStops[i]);
            }
            cx.fillStyle = grd;
            cx.fillRect(0, 0, glob.width, glob.height);
            resolve({
                image: canvas
            });
        });
    }
};

module.exports = {
    name: 'Fills',
    blocks: {
        fillColor,
        gradientFill
    }
};
