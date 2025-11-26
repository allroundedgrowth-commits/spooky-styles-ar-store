import * as THREE from 'three';

interface AtlasRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextureMapping {
  texture: THREE.Texture;
  region: AtlasRegion;
}

export class TextureAtlas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private atlasTexture: THREE.Texture | null = null;
  private textureMap: Map<string, TextureMapping>;
  private currentX: number = 0;
  private currentY: number = 0;
  private rowHeight: number = 0;
  private readonly atlasSize: number;

  constructor(size: number = 2048) {
    this.atlasSize = size;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext('2d')!;
    this.textureMap = new Map();

    // Fill with transparent background
    this.context.clearRect(0, 0, size, size);
  }

  /**
   * Add a texture to the atlas
   */
  async addTexture(id: string, imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Check if we need to move to next row
        if (this.currentX + width > this.atlasSize) {
          this.currentX = 0;
          this.currentY += this.rowHeight;
          this.rowHeight = 0;
        }

        // Check if we have space
        if (this.currentY + height > this.atlasSize) {
          reject(new Error('Atlas is full'));
          return;
        }

        // Draw image to atlas
        this.context.drawImage(img, this.currentX, this.currentY, width, height);

        // Store region info
        const region: AtlasRegion = {
          x: this.currentX,
          y: this.currentY,
          width,
          height,
        };

        // Create texture for this region
        const texture = new THREE.Texture(this.canvas);
        texture.needsUpdate = true;

        this.textureMap.set(id, { texture, region });

        // Update position for next texture
        this.currentX += width;
        this.rowHeight = Math.max(this.rowHeight, height);

        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Build multiple textures into the atlas
   */
  async buildAtlas(textures: { id: string; url: string }[]): Promise<void> {
    console.log(`🎨 Building texture atlas with ${textures.length} textures...`);

    for (const { id, url } of textures) {
      try {
        await this.addTexture(id, url);
      } catch (error) {
        console.warn(`⚠️ Failed to add texture ${id} to atlas:`, error);
      }
    }

    // Create final atlas texture
    this.atlasTexture = new THREE.Texture(this.canvas);
    this.atlasTexture.needsUpdate = true;
    this.atlasTexture.minFilter = THREE.LinearFilter;
    this.atlasTexture.magFilter = THREE.LinearFilter;

    console.log(`✅ Texture atlas built successfully`);
  }

  /**
   * Get UV coordinates for a texture region
   */
  getUVCoordinates(id: string): { u: number; v: number; uScale: number; vScale: number } | null {
    const mapping = this.textureMap.get(id);
    if (!mapping) {
      return null;
    }

    const { region } = mapping;

    return {
      u: region.x / this.atlasSize,
      v: region.y / this.atlasSize,
      uScale: region.width / this.atlasSize,
      vScale: region.height / this.atlasSize,
    };
  }

  /**
   * Apply atlas texture to a material with UV mapping
   */
  applyToMaterial(material: THREE.MeshStandardMaterial, textureId: string): void {
    if (!this.atlasTexture) {
      console.warn('⚠️ Atlas texture not built yet');
      return;
    }

    const uvCoords = this.getUVCoordinates(textureId);
    if (!uvCoords) {
      console.warn(`⚠️ Texture ${textureId} not found in atlas`);
      return;
    }

    // Apply atlas texture
    material.map = this.atlasTexture;

    // Adjust UV coordinates
    material.map.offset.set(uvCoords.u, uvCoords.v);
    material.map.repeat.set(uvCoords.uScale, uvCoords.vScale);

    material.needsUpdate = true;
  }

  /**
   * Get the complete atlas texture
   */
  getAtlasTexture(): THREE.Texture | null {
    return this.atlasTexture;
  }

  /**
   * Export atlas as data URL for debugging
   */
  exportAsDataURL(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Get atlas statistics
   */
  getStats(): {
    size: number;
    textureCount: number;
    usedSpace: number;
    efficiency: number;
  } {
    const totalSpace = this.atlasSize * this.atlasSize;
    let usedSpace = 0;

    this.textureMap.forEach(({ region }) => {
      usedSpace += region.width * region.height;
    });

    return {
      size: this.atlasSize,
      textureCount: this.textureMap.size,
      usedSpace,
      efficiency: (usedSpace / totalSpace) * 100,
    };
  }

  /**
   * Clear the atlas
   */
  clear(): void {
    this.context.clearRect(0, 0, this.atlasSize, this.atlasSize);
    this.textureMap.clear();
    this.currentX = 0;
    this.currentY = 0;
    this.rowHeight = 0;
    this.atlasTexture = null;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.atlasTexture?.dispose();
    this.textureMap.clear();
  }
}

// Singleton instance for accessory textures
export const accessoryAtlas = new TextureAtlas(2048);

export default TextureAtlas;
