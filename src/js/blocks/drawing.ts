import glob = require('./../global.js');
import BlockError = require('./../types/BlockError.js');

const drawCircle = <IBlockTemplate>{
    nameLoc: 'blocks.drawing.drawCircle.name',
    name: 'Draw Circle',
    noPreview: true,
    inputs: [{
        key: 'background',
        type: 'canvas',
        name: 'Background',
        nameLoc: 'blocks.drawing.drawCircle.inputBg',
        optional: true
    }, {
        key: 'fillColor',
        type: 'color',
        name: 'Fill Color',
        nameLoc: 'blocks.drawing.drawCircle.fillColor',
        optional: true
    }, {
        key: 'borderColor',
        type: 'color',
        name: 'Border Color',
        nameLoc: 'blocks.drawing.drawCircle.borderColor',
        optional: true
    }, {
        key: 'radius',
        type: 'number',
        name: 'Radius',
        nameLoc: 'blocks.drawing.drawCircle.inputRadius',
        optional: true,
        hint: '0-1, 1 is drawing to the borders (default)'
    }, {
        key: 'scaleX',
        type: 'number',
        name: 'Scale X',
        nameLoc: 'blocks.drawing.drawCircle.inputScaleX',
        optional: true
    }, {
        key: 'scaleY',
        type: 'number',
        name: 'Scale Y',
        nameLoc: 'blocks.drawing.drawCircle.inputScaleY',
        optional: true
    }, {
        key: 'borderWidth',
        type: 'number',
        name: 'Border Width',
        nameLoc: 'blocks.drawing.drawCircle.borderWidth',
        optional: true,
        hint: '0-1, 0 means no border (default)'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.drawing.drawCircle.outputImage'
    }],
    exec(inputs, block) {
        if (!('fillColor' in inputs) && !('borderColor' in inputs)) {
            return Promise.reject(new BlockError('No fill data or border data was found', block));
        }
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;
            const cx = canvas.getContext('2d');

            if (inputs.background) {
                cx.drawImage(inputs.background, 0, 0);
            }

            cx.translate(canvas.width/2, canvas.height/2);
            cx.scale(inputs.scaleX || 1, inputs.scaleY || 1);
            cx.arc(0, 0, Math.max(canvas.width/2) * (inputs.radius || 1), 0, Math.PI * 2);

            if (inputs.fillColor) {
                cx.fillStyle = inputs.fillColor;
                cx.fill();
            }
            if (inputs.borderWidth) {
                cx.strokeStyle = inputs.borderColor;
                cx.lineWidth = inputs.borderWidth * canvas.width / 2 * (inputs.borderWidth || 0);
                cx.stroke();
            }
            resolve({
                image: canvas
            });
        });
    }
};

const drawRect = <IBlockTemplate>{
    nameLoc: 'blocks.drawing.drawRect.name',
    name: 'Draw Rectangle',
    noPreview: true,
    inputs: [{
        key: 'background',
        type: 'canvas',
        name: 'Background',
        nameLoc: 'blocks.drawing.drawRect.inputBg',
        optional: true
    }, {
        key: 'fillColor',
        type: 'color',
        name: 'Fill Color',
        nameLoc: 'blocks.drawing.drawRect.fillColor',
        optional: true
    }, {
        key: 'borderColor',
        type: 'color',
        name: 'Border Color',
        nameLoc: 'blocks.drawing.drawRect.borderColor',
        optional: true
    }, {
        key: 'scaleX',
        type: 'number',
        name: 'Scale X',
        nameLoc: 'blocks.drawing.drawRect.inputScaleX',
        optional: true
    }, {
        key: 'scaleY',
        type: 'number',
        name: 'Scale Y',
        nameLoc: 'blocks.drawing.drawRect.inputScaleY',
        optional: true
    }, {
        key: 'borderWidth',
        type: 'number',
        name: 'Border Width',
        nameLoc: 'blocks.drawing.drawRect.borderWidth',
        optional: true,
        hint: '0-1, 0 means no border (default)'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.drawing.drawRect.outputImage'
    }],
    exec(inputs, block) {
        if (!('fillColor' in inputs) && !('borderColor' in inputs)) {
            return Promise.reject(new BlockError('No fill data or border data was found', block));
        }
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;
            const cx = canvas.getContext('2d');

            if (inputs.background) {
                cx.drawImage(inputs.background, 0, 0);
            }

            cx.translate(canvas.width/2, canvas.height/2);
            cx.scale(inputs.scaleX || 1, inputs.scaleY || 1);
            cx.rect(-canvas.width / 2, -canvas.height/2, canvas.width, canvas.height);

            if (inputs.fillColor) {
                cx.fillStyle = inputs.fillColor;
                cx.fill();
            }
            if (inputs.borderWidth) {
                cx.strokeStyle = inputs.borderColor;
                cx.lineWidth = inputs.borderWidth * canvas.width / 2 * (inputs.borderWidth || 0);
                cx.stroke();
            }
            resolve({
                image: canvas
            });
        });
    }
};

const drawPoly = <IBlockTemplate>{
    nameLoc: 'blocks.drawing.drawPoly.name',
    name: 'Draw Poly',
    noPreview: true,
    inputs: [{
        key: 'background',
        type: 'canvas',
        name: 'Background',
        nameLoc: 'blocks.drawing.drawPoly.inputBg',
        optional: true
    }, {
        key: 'fillColor',
        type: 'color',
        name: 'Fill Color',
        nameLoc: 'blocks.drawing.drawPoly.fillColor',
        optional: true
    }, {
        key: 'borderColor',
        type: 'color',
        name: 'Border Color',
        nameLoc: 'blocks.drawing.drawPoly.borderColor',
        optional: true
    }, {
        key: 'sides',
        type: 'number',
        name: 'Num of Sides',
        nameLoc: 'blocks.drawing.drawPoly.numOfSides',
        optional: true,
        hint: '3-128, default is 3'
    }, {
        key: 'star',
        type: 'number',
        name: 'Star',
        nameLoc: 'blocks.drawing.drawPoly.star',
        optional: true,
        hint: '0-1, controls how deeply the inner sides should move towards the center'
    }, {
        key: 'scaleX',
        type: 'number',
        name: 'Scale X',
        nameLoc: 'blocks.drawing.drawPoly.inputScaleX',
        optional: true
    }, {
        key: 'scaleY',
        type: 'number',
        name: 'Scale Y',
        nameLoc: 'blocks.drawing.drawPoly.inputScaleY',
        optional: true
    }, {
        key: 'borderWidth',
        type: 'number',
        name: 'Border Width',
        nameLoc: 'blocks.drawing.drawPoly.borderWidth',
        optional: true,
        hint: '0-1, 0 means no border (default)'
    }],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.drawing.drawCircle.outputImage'
    }],
    exec(inputs, block) {
        if (!('fillColor' in inputs) && !('borderColor' in inputs)) {
            return Promise.reject(new BlockError('No fill data or border data was found', block));
        }
        return new Promise((resolve, reject) => {
            var sides = inputs.sides || 3;
            sides = Math.max(3, Math.min(sides, 128));
            const canvas = document.createElement('canvas');
            canvas.width = glob.width;
            canvas.height = glob.height;
            const rad = Math.min(canvas.width, canvas.height) / 2;
            const cx = canvas.getContext('2d');

            if (inputs.background) {
                cx.drawImage(inputs.background, 0, 0);
            }

            cx.translate(canvas.width/2, canvas.height/2);
            cx.scale(inputs.scaleX || 1, inputs.scaleY || 1);

            cx.moveTo(rad, 0);
            for (let i = 0; i <= sides; i++) {
                let r = Math.PI * 2 * i / sides;
                cx.lineTo(rad * Math.sin(r), rad * Math.cos(r));
                if (inputs.star && i !== sides) {
                    r = Math.PI * 2 * (i+0.5) / sides;
                    cx.lineTo(rad * (1-inputs.star) * Math.sin(r), rad * (1-inputs.star) * Math.cos(r));
                }
            }
            cx.closePath();

            if (inputs.fillColor) {
                cx.fillStyle = inputs.fillColor;
                cx.fill();
            }
            if (inputs.borderWidth) {
                cx.strokeStyle = inputs.borderColor;
                cx.lineWidth = inputs.borderWidth * canvas.width / 2 * (inputs.borderWidth || 0);
                cx.stroke();
            }
            resolve({
                image: canvas
            });
        });
    }
};

module.exports = {
    name: 'Drawing',
    blocks: {
        drawCircle,
        drawRect,
        drawPoly
    }
};
