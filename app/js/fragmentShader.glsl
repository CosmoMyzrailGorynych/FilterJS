precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

${uniforms}

${functions}

void main() {
   vec2 pixel = vec2(1.0, 1.0) / u_textureSize;
   // Look up a color from the texture.
   ${source}
}