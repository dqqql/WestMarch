export interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

export interface OffsetCoordinate {
  col: number;
  row: number;
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

export class HexGridUtils {
  static readonly HEX_DIRECTIONS: HexCoordinate[] = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 },
  ];

  static create(q: number, r: number): HexCoordinate {
    return { q, r, s: -q - r };
  }

  static validate(hex: HexCoordinate): boolean {
    return Math.round(hex.q + hex.r + hex.s) === 0;
  }

  static equals(a: HexCoordinate, b: HexCoordinate): boolean {
    return a.q === b.q && a.r === b.r && a.s === b.s;
  }

  static add(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
    return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
  }

  static subtract(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
    return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s };
  }

  static multiply(hex: HexCoordinate, k: number): HexCoordinate {
    return { q: hex.q * k, r: hex.r * k, s: hex.s * k };
  }

  static length(hex: HexCoordinate): number {
    return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
  }

  static distance(a: HexCoordinate, b: HexCoordinate): number {
    return this.length(this.subtract(a, b));
  }

  static direction(direction: number): HexCoordinate {
    return this.HEX_DIRECTIONS[(6 + (direction % 6)) % 6];
  }

  static neighbor(hex: HexCoordinate, direction: number): HexCoordinate {
    return this.add(hex, this.direction(direction));
  }

  static neighbors(hex: HexCoordinate): HexCoordinate[] {
    return this.HEX_DIRECTIONS.map((dir) => this.add(hex, dir));
  }

  static round(frac: { q: number; r: number; s: number }): HexCoordinate {
    let q = Math.round(frac.q);
    let r = Math.round(frac.r);
    let s = Math.round(frac.s);

    const qDiff = Math.abs(q - frac.q);
    const rDiff = Math.abs(r - frac.r);
    const sDiff = Math.abs(s - frac.s);

    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return { q, r, s };
  }

  static lerp(a: HexCoordinate, b: HexCoordinate, t: number): { q: number; r: number; s: number } {
    return {
      q: a.q + (b.q - a.q) * t,
      r: a.r + (b.r - a.r) * t,
      s: a.s + (b.s - a.s) * t,
    };
  }

  static lineDraw(a: HexCoordinate, b: HexCoordinate): HexCoordinate[] {
    const N = this.distance(a, b);
    const results: HexCoordinate[] = [];

    for (let i = 0; i <= N; i++) {
      results.push(this.round(this.lerp(a, b, i / Math.max(N, 1))));
    }

    return results;
  }

  static ring(center: HexCoordinate, radius: number): HexCoordinate[] {
    const results: HexCoordinate[] = [];
    let hex = this.add(center, this.multiply(this.direction(4), radius));

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push(hex);
        hex = this.neighbor(hex, i);
      }
    }

    return results;
  }

  static spiral(center: HexCoordinate, radius: number): HexCoordinate[] {
    const results: HexCoordinate[] = [center];
    for (let k = 1; k <= radius; k++) {
      results.push(...this.ring(center, k));
    }
    return results;
  }

  static offsetToCube(offset: OffsetCoordinate): HexCoordinate {
    const q = offset.col;
    const r = offset.row - (offset.col - (offset.col & 1)) / 2;
    return { q, r, s: -q - r };
  }

  static cubeToOffset(hex: HexCoordinate): OffsetCoordinate {
    const col = hex.q;
    const row = hex.r + (hex.q - (hex.q & 1)) / 2;
    return { col, row };
  }

  static hexToPixel(hex: HexCoordinate, size: number): PixelCoordinate {
    const x = size * (3 / 2) * hex.q;
    const y = size * (Math.sqrt(3) / 2) * hex.q + size * Math.sqrt(3) * hex.r;
    return { x, y };
  }

  static pixelToHex(pixel: PixelCoordinate, size: number): HexCoordinate {
    const q = (2 / 3) * pixel.x / size;
    const r = (-1 / 3) * pixel.x / size + (Math.sqrt(3) / 3) * pixel.y / size;
    return this.round({ q, r, s: -q - r });
  }

  static getHexCorners(size: number): PixelCoordinate[] {
    const corners: PixelCoordinate[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      corners.push({
        x: size * Math.cos(angleRad),
        y: size * Math.sin(angleRad),
      });
    }
    return corners;
  }

  static getHexPath(size: number): string {
    const corners = this.getHexCorners(size);
    return corners.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ') + ' Z';
  }
}
