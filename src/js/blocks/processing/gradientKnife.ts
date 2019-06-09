/**
 * idea and algorithm by Comigo
 * this might be completely new to this world, who knows
 */

import OSWebGL = require('../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

const gradientKnifeOGLCode = '' + glsl`
    vec2 position = v_texCoord,
         velocity = vec2(0.0, 0.0);
    vec4 initial = texture2D(u_image, v_texCoord),
         minimum = texture2D(u_image, v_texCoord),
         maximum = texture2D(u_image, v_texCoord);
    float minimumLuma = luma(minimum),
          maximumLuma = luma(maximum);
    for (int i = 0; i < $iterations; i++) {
        position += velocity * pixel;
        float lW = luma(texture2D(u_image, position - pixel*vec2(0.0, 1.0))),
              lA = luma(texture2D(u_image, position - pixel*vec2(1.0, 0.0))),
              lS = luma(texture2D(u_image, position + pixel*vec2(0.0, 1.0))),
              lD = luma(texture2D(u_image, position + pixel*vec2(1.0, 0.0))),
              lX = luma(texture2D(u_image, position)),
              dX = lD - lA,
              dY = lS - lW;
        velocity -= vec2(dX, dY);
        if (lX > minimumLuma) {
            if (stopAtFailure) {
                break;
            }
            velocity = vec2(-dX, -dY);
        } else {
            minimum = texture2D(u_image, position);
            minimumLuma = luma(minimum);
        }
    }
    position = v_texCoord;
    velocity = vec2(0.0, 0.0);
    for (int i = 0; i < $iterations; i++) {
        position += velocity * pixel;
        float lW = luma(texture2D(u_image, position - pixel*vec2(0.0, 1.0))),
              lA = luma(texture2D(u_image, position - pixel*vec2(1.0, 0.0))),
              lS = luma(texture2D(u_image, position + pixel*vec2(0.0, 1.0))),
              lD = luma(texture2D(u_image, position + pixel*vec2(1.0, 0.0))),
              lX = luma(texture2D(u_image, position)),
              dX = lD - lA,
              dY = lS - lW;
        velocity += vec2(dX, dY);
        if (lX < maximumLuma) {
            if (stopAtFailure) {
                break;
            }
            velocity = vec2(dX, dY);
        } else {
            maximum = texture2D(u_image, position);
            maximumLuma = luma(maximum);
        }
    }
    vec4 threshold = minimum*vec4(percentile, percentile, percentile, 0.5) + maximum*vec4(1.0-percentile, 1.0-percentile, 1.0-percentile, 0.5);
    if (luma(threshold) > luma(initial)) {
        gl_FragColor = minimum;
    } else {
        gl_FragColor = maximum;
    }
`;


const gradientKnife = <IBlockTemplate>{
    nameLoc: 'blocks.processing.gradientKnife.name',
    hint: 'Recovers edges by searching for local minimum and maximum, driven by gradient optimization rule, and choosing either minimum or maximum based on how close they are to the source color. Luma-based.',
    name: 'Gradient Knife',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.gradientKnife.input'
    }, {
        key: 'iterations',
        type: 'number',
        name: 'iterations',
        optional: true,
        hint: 'A number of iterations while searching minimal and maximum values. Higher values provide deeper colors but more "distortions". 25 is the default number.',
        nameLoc: 'blocks.processing.gradientKnife.iterations'
    }, {
        key: 'percentile',
        type: 'number',
        name: 'Percentile',
        optional: true,
        hint: 'A number from 0 (prefer shadows) to 1 (prefer lights). Defaults to 0.5.',
        nameLoc: 'blocks.processing.walkingKnife.percentile'
    }],
    tags: [{
        tag: 'bool-input',
        key: 'stopAtFailure',
        label: 'Stop at failure',
        defaultValue: true
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.composing.gradientKnife.output'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  iterations = inputs.iterations || 25,
                  percentile = inputs.percentile !== void 0? inputs.percentile : 0.5,
                  stopAtFailure = block.tagValues.stopAtFailure || false;
            var method;
            const shot = gradientKnifeOGLCode.replace(/\$iterations/g, Math.floor(iterations).toString());
            console.log({
                percentile,
                stopAtFailure
            });
            (new OSWebGL(shot, {
                percentile: 'float',
                stopAtFailure: 'bool'
            }, glsl`
                float luma(vec4 color) {
                    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                }
            `)).render(inp, {
                percentile,
                stopAtFailure
            }).then(output => {
                resolve({
                    output
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

module.exports = {gradientKnife};
