import OSWebGL = require('../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

/*
Copyright (c) 2015-2018, bacondither
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer
   in this position and unchanged.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHORS ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const firstPassOGL = new OSWebGL(glsl`
    // Get points and clip out of range values (BTB & WTW)
    // [                c9                ]
    // [           c1,  c2,  c3           ]
    // [      c10, c4,  c0,  c5, c11      ]
    // [           c6,  c7,  c8           ]
    // [                c12               ]
    vec3 c[13];
    c[0] = get( 0, 0);
    c[1] = get(-1,-1);
    c[2] = get( 0,-1);
    c[3] = get( 1,-1);
    c[4] = get(-1, 0);
    c[5] = get( 1, 0);
    c[6] = get(-1, 1);
    c[7] = get( 0, 1);
    c[8] = get( 1, 1);
    c[9] = get( 0,-2);
    c[10] = get(-2, 0);
    c[11] = get( 2, 0);
    c[12] = get( 0, 2);

    // Blur, gauss 3x3
    vec3 blur = (2.0*(c[2]+c[4]+c[5]+c[7]) + (c[1]+c[3]+c[6]+c[8]) + 4.0*c[0])*0.0625;

    // Contrast compression, center = 0.5, scaled to 1/3
    float c_comp = clamp(0.266666 + 0.9*exp2(dot(blur, vec3(-2.46666))), 0.0, 1.0);

    // Edge detection
    // Relative matrix weights
    // [          1          ]
    // [      4,  5,  4      ]
    // [  1,  5,  6,  5,  1  ]
    // [      4,  5,  4      ]
    // [          1          ]
    float edge = length(1.38*(b_diff(0))
            + 1.15*(b_diff(2) + b_diff(4)  + b_diff(5)  + b_diff(7))
            + 0.92*(b_diff(1) + b_diff(3)  + b_diff(6)  + b_diff(8))
            + 0.23*(b_diff(9) + b_diff(10) + b_diff(11) + b_diff(12)));

    gl_FragColor = vec4((texture2D(u_image, v_texCoord).rgb), (edge*c_comp + a_offset));
`, {}, glsl`
    //---------------------------------------------------------------------------------
    #define a_offset 0.0         // Edge channel offset, MUST BE THE SAME IN ALL PASSES
    //---------------------------------------------------------------------------------

    // Get destination pixel values
    #define get(x,y)    (clamp(texture2D(u_image, vec2(1.0, 1.0) / u_textureSize*vec2(x, y) + v_texCoord).rgb, 0.0, 1.0) )

    // Component-wise distance
    #define b_diff(pix) ( abs(blur - c[pix]) )
`);

const secondPassOGL = new OSWebGL(glsl`
   // Look up a color from the texture.
    vec4 orig  = get(0, 0);
    float c_edge = orig.a - a_offset;

    if (bounds_check == true) {
        if (c_edge > 24.0 || c_edge < -0.5) {
            gl_FragColor = vec4( 0, 1.0, 0, alpha_out );
            return;
        }
    }

    // Get points, clip out of range colour data in c[0]
    // [                c22               ]
    // [           c24, c9,  c23          ]
    // [      c21, c1,  c2,  c3, c18      ]
    // [ c19, c10, c4,  c0,  c5, c11, c16 ]
    // [      c20, c6,  c7,  c8, c17      ]
    // [           c15, c12, c14          ]
    // [                c13               ]
    vec4 c[25];
    c[0] = sat(orig);
    c[1] = get(-1,-1);
    c[2] = get( 0,-1);
    c[3] = get( 1,-1);
    c[4] = get(-1, 0);
    c[5] = get( 1, 0);
    c[6] = get(-1, 1);
    c[7] = get( 0, 1);
    c[8] = get( 1, 1);
    c[9] = get( 0,-2);
    c[10] = get(-2, 0);
    c[11] = get( 2, 0);
    c[12] = get( 0, 2);
    c[13] = get( 0, 3);
    c[14] = get( 1, 2);
    c[15] = get(-1, 2);
    c[16] = get( 3, 0);
    c[17] = get( 2, 1);
    c[18] = get( 2,-1);
    c[19] = get(-3, 0);
    c[20] = get(-2, 1);
    c[21] = get(-2,-1);
    c[22] = get( 0,-3);
    c[23] = get( 1,-2);
    c[24] = get(-1,-2);

    // Allow for higher overshoot if the current edge pixel is surrounded by similar edge pixels
    float maxedge = max4( max4(c[1].a,c[2].a,c[3].a,c[4].a), max4(c[5].a,c[6].a,c[7].a,c[8].a),
                          max4(c[9].a,c[10].a,c[11].a,c[12].a), c[0].a ) - a_offset;

    // [          x          ]
    // [       z, x, w       ]
    // [    z, z, x, w, w    ]
    // [ y, y, y, 0, y, y, y ]
    // [    w, w, x, z, z    ]
    // [       w, x, z       ]
    // [          x          ]
    float sbe = soft_if(c[2].a,c[9].a, c[22].a)*soft_if(c[7].a,c[12].a,c[13].a)  // x dir
              + soft_if(c[4].a,c[10].a,c[19].a)*soft_if(c[5].a,c[11].a,c[16].a)  // y dir
              + soft_if(c[1].a,c[24].a,c[21].a)*soft_if(c[8].a,c[14].a,c[17].a)  // z dir
              + soft_if(c[3].a,c[23].a,c[18].a)*soft_if(c[6].a,c[20].a,c[15].a); // w dir

    vec2 cs = mix( vec2(L_compr_low,  D_compr_low),
                      vec2(L_compr_high, D_compr_high), smoothstep(2.0, 3.1, sbe) );

    // RGB to luma
    float c0_Y = CtL(c[0]);

    float luma[25];
    luma[0] = c0_Y;
    for (int i = 1; i < 25; i++) {
        luma[i] = CtL(c[i]);
    }

    // Pre-calculated default squared kernel weights
    const vec3 W1 = vec3(0.5,           1.0, 1.41421356237); // 0.25, 1.0, 2.0
    const vec3 W2 = vec3(0.86602540378, 1.0, 0.54772255751); // 0.75, 1.0, 0.3

    // Transition to a concave kernel if the center edge val is above thr
    vec3 dW = pow(mix(W1, W2, smoothstep(dW_lothr, dW_hithr, c_edge)), vec3(2.0));

    float mdiff_c0 = 0.02 + 3.0*( abs(luma[0]-luma[2]) + abs(luma[0]-luma[4])
                              + abs(luma[0]-luma[5]) + abs(luma[0]-luma[7])
                              + 0.25*(abs(luma[0]-luma[1]) + abs(luma[0]-luma[3])
                                     +abs(luma[0]-luma[6]) + abs(luma[0]-luma[8])) );

    // Use lower weights for pixels in a more active area relative to center pixel area
    // This results in narrower and less visible overshoots around sharp edges
    float weights[12];
    weights[0] = min(mdiff_c0/mdiff(24, 21, 2,  4,  9,  10, 1),  dW.y),   // c1
    weights[1] = dW.x;                                                    // c2
    weights[2] = min(mdiff_c0/mdiff(23, 18, 5,  2,  9,  11, 3),  dW.y);   // c3
    weights[3] = dW.x;                                                    // c4
    weights[4] = dW.x;                                                    // c5
    weights[5] = min(mdiff_c0/mdiff(4,  20, 15, 7,  10, 12, 6),  dW.y);   // c6
    weights[6] = dW.x;                                                    // c7
    weights[7] = min(mdiff_c0/mdiff(5,  7,  17, 14, 12, 11, 8),  dW.y);   // c8
    weights[8] = min(mdiff_c0/mdiff(2,  24, 23, 22, 1,  3,  9),  dW.z);   // c9
    weights[9] = min(mdiff_c0/mdiff(20, 19, 21, 4,  1,  6,  10), dW.z);   // c10
    weights[10] = min(mdiff_c0/mdiff(17, 5,  18, 16, 3,  8,  11), dW.z);  // c11
    weights[11] = min(mdiff_c0/mdiff(13, 15, 7,  14, 6,  8,  12), dW.z);  // c12

    weights[0] = (max(max((weights[8]  + weights[9]) / 4.0,  weights[0]), 0.25) + weights[0]) / 2.0;
    weights[2] = (max(max((weights[8]  + weights[10]) / 4.0, weights[2]), 0.25) + weights[2]) / 2.0;
    weights[5] = (max(max((weights[9]  + weights[11]) / 4.0, weights[5]), 0.25) + weights[5]) / 2.0;
    weights[7] = (max(max((weights[10] + weights[11]) / 4.0, weights[7]), 0.25) + weights[7]) / 2.0;

    // Calculate the negative part of the laplace kernel and the low threshold weight
    float lowthrsum   = 0.0;
    float weightsum   = 0.0;
    float neg_laplace = 0.0;

    for (int pix = 0; pix < 12; ++pix) {
        float t      = clamp((c[pix + 1].a - a_offset - 0.01)/(lowthr_mxw - 0.01), 0.0, 1.0);
        float lowthr = t*t*(2.97 - 1.98*t) + 0.01; // t*t*(3.0 - a*3.0 - (2.0 - a*2.0)*t) + a;

        neg_laplace += pow(luma[pix + 1] + 0.06, 2.4)*(weights[pix]*lowthr);
        weightsum   += weights[pix]*lowthr;
        lowthrsum   += lowthr / 12.0;
    }

    neg_laplace = pow(abs(neg_laplace/weightsum), (1.0/2.4)) - 0.06;

    // Compute sharpening magnitude function
    float sharpen_val = curveHeight/(curveHeight*curveslope*pow(abs(c_edge), 3.5) + 0.625);

    // Calculate sharpening diff and scale
    float sharpdiff = (c0_Y - neg_laplace)*(lowthrsum*sharpen_val + 0.01);

    // Calculate local near min & max, partial sort
    float temp;
    for (int j = 0; j < 24; j += 2) {
        temp = luma[j];
        luma[j]   = min(luma[j], luma[j+1]);
        luma[j+1] = max(temp, luma[j+1]);
    }
    for (int jj = 24; jj > 0; jj -= 2) {
        temp = luma[0];
        luma[0]  = min(luma[0], luma[jj]);
        luma[jj] = max(temp, luma[jj]);
        temp = luma[24];
        luma[24] = max(luma[24], luma[jj-1]);
        luma[jj-1] = min(temp, luma[jj-1]);
    }

    for (int j = 1; j < 23; j += 2) {
        temp = luma[j];
        luma[j]   = min(luma[j], luma[j+1]);
        luma[j+1] = max(temp, luma[j+1]);
    }
    for (int jj = 23; jj > 1; jj -= 2) {
        temp = luma[1];
        luma[1]  = min(luma[1], luma[jj]);
        luma[jj] = max(temp, luma[jj]);
        temp = luma[23];
        luma[23] = max(luma[23], luma[jj-1]);
        luma[jj-1] = min(temp, luma[jj-1]);
    }

    for (int j = 3; j < 22; j += 2) {
        temp = luma[j];
        luma[j]   = min(luma[j], luma[j+1]);
        luma[j+1] = max(temp, luma[j+1]);
    }
    for (int jj = 22; jj > 2; jj -= 2) {
        temp = luma[2];
        luma[2]  = min(luma[2], luma[jj]);
        luma[jj] = max(temp, luma[jj]);
        temp = luma[22];
        luma[22] = max(luma[22], luma[jj-1]);
        luma[jj-1] = min(temp, luma[jj-1]);
    }

    float nmax = (max(luma[22] + luma[23]*2.0, c0_Y*3.0) + luma[24]) / 4.0;
    float nmin = (min(luma[2]  + luma[1]*2.0,  c0_Y*3.0) + luma[0]) / 4.0;

    // Calculate tanh scale factors
    float min_dist  = min(abs(nmax - c0_Y), abs(c0_Y - nmin));
    float pos_scale = min_dist + min(L_overshoot, 1.0001 - min_dist - c0_Y);
    float neg_scale = min_dist + min(D_overshoot, 0.0001 + c0_Y - min_dist);

    pos_scale = min(pos_scale, scale_lim*(1.0 - scale_cs) + pos_scale*scale_cs);
    neg_scale = min(neg_scale, scale_lim*(1.0 - scale_cs) + neg_scale*scale_cs);

    // Soft limited anti-ringing with tanh, wpmean to control compression slope
    sharpdiff = wpmean( max(sharpdiff, 0.0), soft_lim( max(sharpdiff, 0.0), pos_scale ), cs.x )
              - wpmean( min(sharpdiff, 0.0), soft_lim( min(sharpdiff, 0.0), neg_scale ), cs.y );

    // Compensate for saturation loss/gain while making pixels brighter/darker
    float sharpdiff_lim = clamp(c0_Y + sharpdiff, 0.0, 1.0) - c0_Y;
    float satmul = (c0_Y + max(sharpdiff_lim*0.9, sharpdiff_lim)*1.03 + 0.03)/(c0_Y + 0.03);
    vec3 res = c0_Y + (sharpdiff_lim*3.0 + sharpdiff)/4.0 + (c[0].rgb - c0_Y)*satmul;

    gl_FragColor = vec4( (video_level_out == true ? res + orig.rgb - c[0].rgb : res), alpha_out );
`, {
    curveHeight: 'float'
}, glsl`

    //--------------------------------------- Settings ------------------------------------------------

    // define curveHeight    1.0               // Main control of sharpening strength [>0]
                                                // 0.3 <-> 2.0 is a reasonable range of values

    #define video_level_out false                // True to preserve BTB & WTW (minor summation error)
                                                // Normally it should be set to false

    //-------------------------------------------------------------------------------------------------
    // Defined values under this row are "optimal" DO NOT CHANGE IF YOU DO NOT KNOW WHAT YOU ARE DOING!

    #define curveslope      0.5                  // Sharpening curve slope, high edge values

    #define L_overshoot     0.003                // Max light overshoot before compression [>0.001]
    #define L_compr_low     0.167                // Light compression, default (0.167=~6x)
    #define L_compr_high    0.334                // Light compression, surrounded by edges (0.334=~3x)

    #define D_overshoot     0.009                // Max dark overshoot before compression [>0.001]
    #define D_compr_low     0.250                // Dark compression, default (0.250=4x)
    #define D_compr_high    0.500                // Dark compression, surrounded by edges (0.500=2x)

    #define scale_lim       0.1                  // Abs max change before compression [>0.01]
    #define scale_cs        0.056                // Compression slope above scale_lim

    #define dW_lothr        0.3                  // Start interpolating between W1 and W2
    #define dW_hithr        0.8                  // When dW is equal to W2

    #define lowthr_mxw      0.1                  // Edge value for max lowthr weight [>0.01]

    #define pm_p            0.7                  // Power mean p-value [>0-1.0]

    #define alpha_out       1.0                  // MPDN requires the alpha channel output to be 1.0

    //-------------------------------------------------------------------------------------------------
    #define a_offset        0.0                  // Edge channel offset, MUST BE THE SAME IN ALL PASSES
    #define bounds_check    false                 // If edge data is outside bounds, make pixels green
    //-------------------------------------------------------------------------------------------------

    // Soft if, fast linear approx
    #define soft_if(a,b,c) (clamp((a + b + c - 3.0*a_offset + 0.056)/(abs(maxedge) + 0.03) - 0.85, 0.0, 1.0))

    // Soft limit, modified tanh
    #define soft_lim(v,s)  ((exp(2.0*min(abs(v), s*24.0)/s) - 1.0)/(exp(2.0*min(abs(v), s*24.0)/s) + 1.0)*s)

    // Weighted power mean
    #define wpmean(a,b,w)  (pow(w*pow(abs(a), pm_p) + abs(1.0-w)*pow(abs(b), pm_p), (1.0/pm_p)))

    // Get destination pixel values
    #define get(x,y)       (texture2D(u_image, vec2(1.0, 1.0) / u_textureSize*vec2(x, y) + v_texCoord))
    #define sat(var)       (vec4(clamp((var).rgb, 0.0, 1.0), (var).a) )

    // Maximum of four values
    #define max4(a,b,c,d)  ( max(max(a, b), max(c, d)) )

    // Colour to luma, fast approx gamma, avg of rec. 709 & 601 luma coeffs
    #define CtL(RGB)       ( sqrt(dot(vec3(0.2558, 0.6511, 0.0931), clamp((RGB)*abs(RGB), 0.0, 1.0).rgb)) )

    // Center pixel diff
    #define mdiff(a,b,c,d,e,f,g) ( abs(luma[g] - luma[a]) + abs(luma[g] - luma[b])       \
                                + abs(luma[g] - luma[c]) + abs(luma[g] - luma[d])       \
                                + 0.5*(abs(luma[g] - luma[e]) + abs(luma[g] - luma[f])) )
`);

const adaptiveSharpen = <IBlockTemplate>{
    nameLoc: 'blocks.processing.adaptiveSharpen.name',
    name: 'Adaptive sharpen',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.adaptiveSharpen.input'
    }, {
        key: 'strength',
        type: 'number',
        name: 'Strength',
        nameLoc: 'blocks.processing.adaptiveSharpen.strength',
        hint: 'A number between 0 and 1; 1 produces the most sharp results',
        optional: true
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.composing.adaptiveSharpen.output'
    }],
    exec(inputs, block) {
        const inp = inputs.input,
              curveHeight = (Math.max(0, Math.min(1, inputs.strength === void 0? 0.5 : inputs.strength)) + 0.3) * 1.7;
        return new Promise((resolve, reject) => {
            firstPassOGL.render(inp)
            .then(intermediate => secondPassOGL.render(inp, {
                curveHeight
            }))
            .then(result => {
                resolve({
                    output: result
                });
            })
            .catch(err => {
                throw new BlockError(err, block);
            });
        });
    }
};

module.exports = {
    adaptiveSharpen
};
