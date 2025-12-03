/**
 * Buffer Manager
 * 
 * Manages efficient reuse of ImageData buffers to minimize memory allocation
 * and garbage collection overhead during hair segmentation and flattening operations.
 * 
 * Key Features:
 * - Buffer pooling with maximum 5 buffers
 * - Automatic cleanup of oldest buffers when limit reached
 * - Memory footprint tracking (< 100MB requirement)
 * - Session cleanup for AR session end
 * 
 * Requirements: 1.1, 2.5
 */

/**
 * Buffer pool entry with metadata
 */
interface BufferEntry {
  buffer: ImageData;
  width: number;
  height: number;
  lastUsed: number;
  size: number; // Size in bytes
}

/**
 * BufferManager
 * 
 * Provides efficient ImageData buffer pooling to reduce memory allocation
 * overhead during real-time hair processing operations.
 */
export class BufferManager {
  private bufferPool: BufferEntry[] = [];
  private readonly maxBuffers: number = 5;
  private readonly maxMemoryBytes: number = 100 * 1024 * 1024; // 100MB
  private currentMemoryUsage: number = 0;

  /**
   * Get a buffer from the pool or create a new one
   * Reuses existing buffers when possible to minimize allocations
   * 
   * @param width - Required buffer width
   * @param height - Required buffer height
   * @returns ImageData buffer ready for use
   */
  getBuffer(width: number, height: number): ImageData {
    // Try to find an existing buffer with matching dimensions
    const matchingIndex = this.bufferPool.findIndex(
      entry => entry.width === width && entry.height === height
    );

    if (matchingIndex !== -1) {
      // Reuse existing buffer
      const entry = this.bufferPool[matchingIndex];
      entry.lastUsed = Date.now();
      
      // Clear the buffer data for reuse
      entry.buffer.data.fill(0);
      
      return entry.buffer;
    }

    // No matching buffer found, create a new one
    const buffer = new ImageData(width, height);
    const size = width * height * 4; // RGBA = 4 bytes per pixel

    // Check if we need to make room
    if (this.bufferPool.length >= this.maxBuffers) {
      this.removeOldestBuffer();
    }

    // Check if adding this buffer would exceed memory limit
    if (this.currentMemoryUsage + size > this.maxMemoryBytes) {
      // Remove buffers until we have enough space
      while (
        this.bufferPool.length > 0 &&
        this.currentMemoryUsage + size > this.maxMemoryBytes
      ) {
        this.removeOldestBuffer();
      }

      // If still not enough space, return buffer without pooling
      if (this.currentMemoryUsage + size > this.maxMemoryBytes) {
        console.warn(
          `BufferManager: Cannot pool buffer (${size} bytes) - would exceed memory limit`
        );
        return buffer;
      }
    }

    // Add to pool
    const entry: BufferEntry = {
      buffer,
      width,
      height,
      lastUsed: Date.now(),
      size
    };

    this.bufferPool.push(entry);
    this.currentMemoryUsage += size;

    return buffer;
  }

  /**
   * Return a buffer to the pool
   * Marks the buffer as available for reuse
   * 
   * @param buffer - Buffer to return to pool
   */
  returnBuffer(buffer: ImageData): void {
    const entry = this.bufferPool.find(e => e.buffer === buffer);
    
    if (entry) {
      entry.lastUsed = Date.now();
    }
    // If buffer is not in pool, it will be garbage collected naturally
  }

  /**
   * Remove the oldest (least recently used) buffer from the pool
   * Frees memory for new allocations
   */
  private removeOldestBuffer(): void {
    if (this.bufferPool.length === 0) {
      return;
    }

    // Find the buffer with the oldest lastUsed timestamp
    let oldestIndex = 0;
    let oldestTime = this.bufferPool[0].lastUsed;

    for (let i = 1; i < this.bufferPool.length; i++) {
      if (this.bufferPool[i].lastUsed < oldestTime) {
        oldestIndex = i;
        oldestTime = this.bufferPool[i].lastUsed;
      }
    }

    // Remove the oldest buffer
    const removed = this.bufferPool.splice(oldestIndex, 1)[0];
    this.currentMemoryUsage -= removed.size;
  }

  /**
   * Clear all buffers from the pool
   * Should be called when AR session ends or when cleaning up
   */
  clearBuffers(): void {
    this.bufferPool = [];
    this.currentMemoryUsage = 0;
  }

  /**
   * Get current memory usage in bytes
   * 
   * @returns Current memory usage
   */
  getMemoryUsage(): number {
    return this.currentMemoryUsage;
  }

  /**
   * Get current memory usage in megabytes
   * 
   * @returns Current memory usage in MB
   */
  getMemoryUsageMB(): number {
    return this.currentMemoryUsage / (1024 * 1024);
  }

  /**
   * Get the number of buffers currently in the pool
   * 
   * @returns Number of pooled buffers
   */
  getBufferCount(): number {
    return this.bufferPool.length;
  }

  /**
   * Get detailed statistics about the buffer pool
   * 
   * @returns Buffer pool statistics
   */
  getStats(): {
    bufferCount: number;
    memoryUsageMB: number;
    maxBuffers: number;
    maxMemoryMB: number;
    buffers: Array<{
      width: number;
      height: number;
      sizeMB: number;
      lastUsed: Date;
    }>;
  } {
    return {
      bufferCount: this.bufferPool.length,
      memoryUsageMB: this.getMemoryUsageMB(),
      maxBuffers: this.maxBuffers,
      maxMemoryMB: this.maxMemoryBytes / (1024 * 1024),
      buffers: this.bufferPool.map(entry => ({
        width: entry.width,
        height: entry.height,
        sizeMB: entry.size / (1024 * 1024),
        lastUsed: new Date(entry.lastUsed)
      }))
    };
  }

  /**
   * Check if memory usage is within acceptable limits
   * 
   * @returns true if memory usage is under 100MB, false otherwise
   */
  isMemoryHealthy(): boolean {
    return this.currentMemoryUsage < this.maxMemoryBytes;
  }

  /**
   * Force cleanup of unused buffers to free memory
   * Removes all buffers that haven't been used in the last 30 seconds
   */
  forceCleanup(): void {
    const now = Date.now();
    const maxAge = 30000; // 30 seconds

    const indicesToRemove: number[] = [];

    for (let i = 0; i < this.bufferPool.length; i++) {
      if (now - this.bufferPool[i].lastUsed > maxAge) {
        indicesToRemove.push(i);
      }
    }

    // Remove in reverse order to maintain indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const removed = this.bufferPool.splice(indicesToRemove[i], 1)[0];
      this.currentMemoryUsage -= removed.size;
    }

    if (indicesToRemove.length > 0) {
      console.log(`BufferManager: Cleaned up ${indicesToRemove.length} unused buffers`);
    }
  }
}
