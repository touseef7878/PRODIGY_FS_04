/**
 * Performance utilities for Prochat app
 */

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }) as T;
}

// Throttle function to limit function calls at a regular interval
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

// Memoize function to cache function results
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy load images to improve performance
export function lazyLoadImage(src: string, callback: (img: HTMLImageElement) => void) {
  const img = new Image();
  img.onload = () => callback(img);
  img.src = src;
}

// Virtual scroll helper for long lists
export class VirtualScroller {
  container: HTMLElement;
  items: HTMLElement[];
  itemHeight: number;
  visibleCount: number;
  startIndex: number;
  endIndex: number;

  constructor(container: HTMLElement, items: HTMLElement[], itemHeight: number) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 1;
    this.startIndex = 0;
    this.endIndex = this.visibleCount;
  }

  updateScroll(scrollTop: number) {
    this.startIndex = Math.floor(scrollTop / this.itemHeight);
    this.endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    
    this.items.forEach((item, index) => {
      if (index >= this.startIndex && index <= this.endIndex) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
}