import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const computeNormalsOGL = new OSWebGL(glsl`
    vec4 left = texture2D(u_image, v_texCoord - vec2(-pixel.x, 0.0));
    vec4 top = texture2D(u_image, v_texCoord - vec2(0.0, -pixel.y));
    vec4 right = texture2D(u_image, v_texCoord - vec2(pixel.x, 0.0));
    vec4 bottom = texture2D(u_image, v_texCoord - vec2(0.0, pixel.y));
    float leftMax = max(left.r, max(left.g, left.b));
    float topMax = max(top.r, max(top.g, top.b));
    float rightMax = max(right.r, max(right.g, right.b));
    float bottomMax = max(bottom.r, max(bottom.g, bottom.b));
    gl_FragColor.r = 0.5 + (leftMax-rightMax) * intensity;
    gl_FragColor.g = 0.5 + (topMax-bottomMax) * intensity;
    gl_FragColor.b = 1.0;
    gl_FragColor.a = 1.0;
`, {
    intensity: 'number'
});
const computeNormals = <IBlockTemplate>{
    nameLoc: 'blocks.processing.computeNormals.name',
    name: 'Normal',
    inputs: [{
        key: 'height',
        type: 'canvas',
        name: 'Height',
        nameLoc: 'blocks.processing.computeNormals.inputHeight'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.computeNormals.inputIntensity',
        optional: true
    }],
    outputs: [{
        key: 'normals',
        type: 'canvas',
        name: 'Normals',
        nameLoc: 'blocks.processing.computeNormals.outputNormals',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.height,
                intensity = inputs.intensity || 1;
            computeNormalsOGL.render(inp, {
                intensity
            })
            .then(image => {
                resolve({
                    normals: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

const computeMaxAtPoint = (input: ImageData, x: number, y: number) => {
    const p = (input.width * y + x)*4;
    return Math.max(input.data[p], input.data[p+1], input.data[p+2]);
};
const computeNormalsPixels = <IBlockTemplate>{
    nameLoc: 'blocks.processing.computeNormalsPixels.name',
    name: 'Normal (Pixels)',
    inputs: [{
        key: 'height',
        type: 'pixels',
        name: 'Height',
        nameLoc: 'blocks.processing.computeNormalsPixels.inputHeight'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.computeNormalsPixels.inputIntensity',
        optional: true
    }],
    outputs: [{
        key: 'normals',
        type: 'pixels',
        name: 'Normals',
        nameLoc: 'blocks.processing.computeNormalsPixels.outputNormals',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.height,
                out = document.createElement('canvas').getContext('2d')
                        .createImageData(inp.width, inp.height),
                intensity = inputs.intensity || 1;
            for (let x = 1; x < inp.width - 1; x++) {
                for (let y = 1; y < inp.height - 1; y++) {
                    var p = (x + y*inp.width) * 4;
                    out.data[p] = 127 - (computeMaxAtPoint(inp, x-1, y) - computeMaxAtPoint(inp, x+1, y)) * intensity;
                    out.data[p+1] = 127 - (computeMaxAtPoint(inp, x, y-1) - computeMaxAtPoint(inp, x, y+1)) * intensity;
                    out.data[p+2] = 255;
                    out.data[p+3] = 255;
                }
            }
            // work with edges
            for (let y = 0; y < inp.height; y++) {
                var p = y*inp.width*4; // left edge
                out.data[p] = 127 + (computeMaxAtPoint(inp, 0, y) - computeMaxAtPoint(inp, 1, y)) * intensity;
                if (y > 0 && y < inp.height -1) {
                    out.data[p+1] = 127 + (computeMaxAtPoint(inp, 0, y-1) - computeMaxAtPoint(inp, 1, y+1)) * intensity;
                }
                out.data[p+2] = 255;
                out.data[p+3] = 255;

                var p = ((y+1)*inp.width - 1)*4; // right edge
                out.data[p] = 127 + (computeMaxAtPoint(inp, inp.width-2, y) - computeMaxAtPoint(inp, inp.width-1, y)) * intensity;
                if (y > 0 && y < inp.height -1) {
                    out.data[p+1] = 127 + (computeMaxAtPoint(inp, inp.width-1, y-1) - computeMaxAtPoint(inp, inp.width-1, y+1)) * intensity;
                }
                out.data[p+2] = 255;
                out.data[p+3] = 255;
            }
            for (let x = 0; x < inp.width; x++) {
                var p = x*4; // top edge
                if (x > 0 && x < inp.width - 1) {
                    out.data[p] = 127 + (computeMaxAtPoint(inp, x-1, 0) - computeMaxAtPoint(inp, x+1, 1)) * intensity;
                }
                out.data[p+1] = 127 + (computeMaxAtPoint(inp, x, 0) - computeMaxAtPoint(inp, x, 1)) * intensity;
                out.data[p+2] = 255;
                out.data[p+3] = 255;

                p = (inp.width*(inp.height-1) + x)*4; // bottom edge
                if (x > 0 && x < inp.width - 1) {
                    out.data[p] = 127 + (computeMaxAtPoint(inp, x-1, inp.height-1) - computeMaxAtPoint(inp, x+1, inp.height-1)) * intensity;
                }
                out.data[p+1] = 127 + (computeMaxAtPoint(inp, x, inp.height-2) - computeMaxAtPoint(inp, x, inp.height-1)) * intensity;
                out.data[p+2] = 255;
                out.data[p+3] = 255;
            }
            resolve({
                normals: out
            });
        });
    }
};

module.exports = {
    computeNormals,
    computeNormalsPixels
};
