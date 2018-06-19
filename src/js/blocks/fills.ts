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

const gradientLinear = <IBlockTemplate>{
    nameLoc: 'blocks.generators.gradientLinear.name',
    name: 'Linear Gradient',
    noPreview: true,
    inputs: [{
        key: 'color1',
        type: 'color',
        name: 'Color 1',
        nameLoc: 'blocks.generators.gradientLinear.inputColor1'
    }, {
        key: 'color2',
        type: 'color',
        name: 'Color 2',
        nameLoc: 'blocks.generators.gradientLinear.inputColor2',
        optional: true,
    }, {
        key: 'color3',
        type: 'color',
        name: 'Color 3',
        nameLoc: 'blocks.generators.gradientLinear.inputColor3',
        optional: true,
    }, {
        key: 'color4',
        type: 'color',
        name: 'Color 4',
        nameLoc: 'blocks.generators.gradientLinear.inputColor4',
        optional: true,
    }, {
        key: 'color5',
        type: 'color',
        name: 'Color 5',
        nameLoc: 'blocks.generators.gradientLinear.inputColor5'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.generators.gradientLinear.outputImage'
    }],
    tags: [{
        tag: 'bool-input',
        key: 'horizontal',
        label: 'Horizontal',
        defaultValue: false
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');

            canvas.width = glob.width;
            canvas.height = glob.height;
            const cx = canvas.getContext('2d'),
                  grd = cx.createLinearGradient(0, 0,
                    block.tagValues.horizontal? glob.width : 0,
                    block.tagValues.horizontal? 0 : glob.height);
            const colorStops = [inputs.color1, inputs.color2, inputs.color3, inputs.color4, inputs.color5]
                  .filter(color => color);
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

module.exports = {fillColor, gradientLinear};
