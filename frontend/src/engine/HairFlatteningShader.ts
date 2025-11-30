/**
 * Hair Flattening WebGL Shader
 * 
 * GPU-accelerated hair flattening using WebGL fragment shaders.
 * Provides optimized performance for mobile devices.
 * 
 * Requirements: 2.1, 2.2, 2.5
 */

/**
 * Vertex shader for texture rendering
 * Simple pass-through shader that maps texture coordinates
 */
const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

/**
 * Fragment shader for hair flattening effect
 * Applies volume reduction, edge smoothing, and scalp preservation
 */
const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform sampler2D u_mask;
  uniform float u_volumeReduction;
  uniform float u_blendRadius;
  uniform vec2 u_resolution;
  uniform int u_mode; // 0=normal, 1=flattened, 2=bald

  varying vec2 v_texCoord;

  // Check if a color is likely a skin tone
  bool isSkinTone(vec3 color) {
    // Skin tones: R > G > B, moderate brightness
    return color.r > color.g && 
           color.g > color.b && 
           color.r > 0.235 && 
           color.r < 1.0;
  }

  // Apply Gaussian-like blur for edge smoothing
  vec3 applyEdgeSmoothing(vec2 texCoord, float maskValue) {
    // Only smooth near edges (mask value between 0.1 and 0.9)
    if (maskValue < 0.1 || maskValue > 0.9) {
      return texture2D(u_image, texCoord).rgb;
    }

    vec3 color = vec3(0.0);
    float totalWeight = 0.0;
    float radius = u_blendRadius;
    vec2 pixelSize = 1.0 / u_resolution;

    // Sample pixels within radius
    for (float dy = -5.0; dy <= 5.0; dy += 1.0) {
      for (float dx = -5.0; dx <= 5.0; dx += 1.0) {
        if (abs(dx) > radius || abs(dy) > radius) continue;

        vec2 offset = vec2(dx, dy) * pixelSize;
        vec2 sampleCoord = texCoord + offset;

        // Gaussian-like weight based on distance
        float distance = length(vec2(dx, dy));
        float weight = exp(-(distance * distance) / (2.0 * radius * radius));

        color += texture2D(u_image, sampleCoord).rgb * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0.0 ? color / totalWeight : texture2D(u_image, texCoord).rgb;
  }

  // Estimate scalp color by sampling nearby non-hair pixels
  vec3 estimateScalpColor(vec2 texCoord) {
    vec3 scalpColor = vec3(0.0);
    float count = 0.0;
    float sampleRadius = 20.0;
    vec2 pixelSize = 1.0 / u_resolution;

    // Sample pixels in a radius
    for (float dy = -20.0; dy <= 20.0; dy += 4.0) {
      for (float dx = -20.0; dx <= 20.0; dx += 4.0) {
        if (abs(dx) > sampleRadius || abs(dy) > sampleRadius) continue;

        vec2 offset = vec2(dx, dy) * pixelSize;
        vec2 sampleCoord = texCoord + offset;

        float sampleMask = texture2D(u_mask, sampleCoord).r;

        // Only sample non-hair pixels
        if (sampleMask < 0.2) {
          scalpColor += texture2D(u_image, sampleCoord).rgb;
          count += 1.0;
        }
      }
    }

    // Return average or default skin tone
    if (count > 0.0) {
      return scalpColor / count;
    } else {
      return vec3(0.824, 0.706, 0.627); // Default skin tone
    }
  }

  void main() {
    vec4 imageColor = texture2D(u_image, v_texCoord);
    float maskValue = texture2D(u_mask, v_texCoord).r;

    // Mode 0: Normal - return original image
    if (u_mode == 0) {
      gl_FragColor = imageColor;
      return;
    }

    // Preserve scalp regions (low mask value + skin tone)
    if (maskValue < 0.3 && isSkinTone(imageColor.rgb)) {
      gl_FragColor = imageColor;
      return;
    }

    // Mode 1: Flattened - reduce volume and smooth edges
    if (u_mode == 1) {
      if (maskValue > 0.1) {
        // Darken hair slightly to simulate compression
        float darkenFactor = 1.0 - (u_volumeReduction * 0.15);
        vec3 flattenedColor = imageColor.rgb * darkenFactor;

        // Apply edge smoothing
        vec3 smoothedColor = applyEdgeSmoothing(v_texCoord, maskValue);

        // Blend between flattened and smoothed based on mask value
        vec3 finalColor = mix(flattenedColor, smoothedColor, 0.5);

        gl_FragColor = vec4(finalColor, imageColor.a);
      } else {
        gl_FragColor = imageColor;
      }
      return;
    }

    // Mode 2: Bald - remove all hair
    if (u_mode == 2) {
      if (maskValue > 0.3) {
        // Replace hair with estimated scalp color
        vec3 scalpColor = estimateScalpColor(v_texCoord);

        // Apply heavy smoothing for natural appearance
        vec3 smoothedColor = applyEdgeSmoothing(v_texCoord, maskValue);

        // Blend scalp color with smoothed result
        vec3 finalColor = mix(scalpColor, smoothedColor, 0.3);

        gl_FragColor = vec4(finalColor, imageColor.a);
      } else {
        gl_FragColor = imageColor;
      }
      return;
    }

    // Fallback
    gl_FragColor = imageColor;
  }
`;

/**
 * WebGL-based hair flattening processor
 * Provides GPU-accelerated image processing for better performance
 */
export class HairFlatteningShader {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private canvas: HTMLCanvasElement | null = null;
  
  // Shader locations
  private locations: {
    position?: number;
    texCoord?: number;
    image?: WebGLUniformLocation | null;
    mask?: WebGLUniformLocation | null;
    volumeReduction?: WebGLUniformLocation | null;
    blendRadius?: WebGLUniformLocation | null;
    resolution?: WebGLUniformLocation | null;
    mode?: WebGLUniformLocation | null;
  } = {};

  // Textures
  private imageTexture: WebGLTexture | null = null;
  private maskTexture: WebGLTexture | null = null;

  // Buffers
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  /**
   * Initialize WebGL context and compile shaders
   * 
   * @param width - Canvas width
   * @param height - Canvas height
   * @returns True if initialization successful
   */
  initialize(width: number, height: number): boolean {
    try {
      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;

      // Get WebGL context
      this.gl = this.canvas.getContext('webgl', {
        premultipliedAlpha: false,
        preserveDrawingBuffer: true
      });

      if (!this.gl) {
        console.error('WebGL not supported');
        return false;
      }

      // Compile shaders
      const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

      if (!vertexShader || !fragmentShader) {
        console.error('Failed to compile shaders');
        return false;
      }

      // Link program
      this.program = this.linkProgram(vertexShader, fragmentShader);

      if (!this.program) {
        console.error('Failed to link shader program');
        return false;
      }

      // Get attribute and uniform locations
      this.locations.position = this.gl.getAttribLocation(this.program, 'a_position');
      this.locations.texCoord = this.gl.getAttribLocation(this.program, 'a_texCoord');
      this.locations.image = this.gl.getUniformLocation(this.program, 'u_image');
      this.locations.mask = this.gl.getUniformLocation(this.program, 'u_mask');
      this.locations.volumeReduction = this.gl.getUniformLocation(this.program, 'u_volumeReduction');
      this.locations.blendRadius = this.gl.getUniformLocation(this.program, 'u_blendRadius');
      this.locations.resolution = this.gl.getUniformLocation(this.program, 'u_resolution');
      this.locations.mode = this.gl.getUniformLocation(this.program, 'u_mode');

      // Create buffers
      this.setupBuffers();

      // Create textures
      this.imageTexture = this.createTexture();
      this.maskTexture = this.createTexture();

      return true;
    } catch (error) {
      console.error('Failed to initialize WebGL shader:', error);
      return false;
    }
  }

  /**
   * Compile a shader
   * 
   * @param type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
   * @param source - Shader source code
   * @returns Compiled shader or null
   */
  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    // Check compilation status
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Link shader program
   * 
   * @param vertexShader - Compiled vertex shader
   * @param fragmentShader - Compiled fragment shader
   * @returns Linked program or null
   */
  private linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    if (!this.gl) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    // Check link status
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  /**
   * Setup vertex and texture coordinate buffers
   */
  private setupBuffers(): void {
    if (!this.gl) return;

    // Position buffer (full screen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Texture coordinate buffer
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }

  /**
   * Create a WebGL texture
   * 
   * @returns Created texture or null
   */
  private createTexture(): WebGLTexture | null {
    if (!this.gl) return null;

    const texture = this.gl.createTexture();
    if (!texture) return null;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Set texture parameters for non-power-of-2 textures
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    return texture;
  }

  /**
   * Upload ImageData to a texture
   * 
   * @param texture - Target texture
   * @param imageData - Image data to upload
   */
  private uploadTexture(texture: WebGLTexture, imageData: ImageData): void {
    if (!this.gl) return;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      imageData
    );
  }

  /**
   * Process image using GPU shader
   * 
   * @param imageData - Original image
   * @param maskData - Hair mask
   * @param mode - Processing mode (0=normal, 1=flattened, 2=bald)
   * @param volumeReduction - Volume reduction factor (0.6-0.8)
   * @param blendRadius - Edge blend radius (minimum 5)
   * @returns Processed image data
   */
  process(
    imageData: ImageData,
    maskData: ImageData,
    mode: number,
    volumeReduction: number,
    blendRadius: number
  ): ImageData | null {
    if (!this.gl || !this.program || !this.canvas) {
      console.error('WebGL not initialized');
      return null;
    }

    try {
      // Upload textures
      if (this.imageTexture) {
        this.uploadTexture(this.imageTexture, imageData);
      }
      if (this.maskTexture) {
        this.uploadTexture(this.maskTexture, maskData);
      }

      // Use shader program
      this.gl.useProgram(this.program);

      // Bind textures
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture);
      this.gl.uniform1i(this.locations.image!, 0);

      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.maskTexture);
      this.gl.uniform1i(this.locations.mask!, 1);

      // Set uniforms
      this.gl.uniform1f(this.locations.volumeReduction!, volumeReduction);
      this.gl.uniform1f(this.locations.blendRadius!, blendRadius);
      this.gl.uniform2f(this.locations.resolution!, imageData.width, imageData.height);
      this.gl.uniform1i(this.locations.mode!, mode);

      // Bind buffers
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.enableVertexAttribArray(this.locations.position!);
      this.gl.vertexAttribPointer(this.locations.position!, 2, this.gl.FLOAT, false, 0, 0);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
      this.gl.enableVertexAttribArray(this.locations.texCoord!);
      this.gl.vertexAttribPointer(this.locations.texCoord!, 2, this.gl.FLOAT, false, 0, 0);

      // Draw
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      // Read pixels back
      const pixels = new Uint8ClampedArray(imageData.width * imageData.height * 4);
      this.gl.readPixels(
        0, 0,
        imageData.width, imageData.height,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        pixels
      );

      // Create result ImageData
      return new ImageData(pixels, imageData.width, imageData.height);
    } catch (error) {
      console.error('Error processing with WebGL shader:', error);
      return null;
    }
  }

  /**
   * Check if WebGL is supported
   * 
   * @returns True if WebGL is available
   */
  static isSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Dispose of WebGL resources
   */
  dispose(): void {
    if (!this.gl) return;

    // Delete textures
    if (this.imageTexture) {
      this.gl.deleteTexture(this.imageTexture);
      this.imageTexture = null;
    }
    if (this.maskTexture) {
      this.gl.deleteTexture(this.maskTexture);
      this.maskTexture = null;
    }

    // Delete buffers
    if (this.positionBuffer) {
      this.gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }
    if (this.texCoordBuffer) {
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.texCoordBuffer = null;
    }

    // Delete program
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    this.gl = null;
    this.canvas = null;
  }
}
