/**
 * Color class, please use color() to construct a color
 * @class Color
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @see color
 */
export class Color {
  _val: number;

  constructor(r?: number, g?: number, b?: number, a?: number) {
    r = r || 0;
    g = g || 0;
    b = b || 0;
    a = typeof a === 'number' ? a : 255;
    this._val = ((r << 24) >>> 0) + (g << 16) + (b << 8) + a;
  }

  // r
  get r(): number {
    return (this._val & 0xff000000) >>> 24;
  }

  set r(value: number) {
    this._val = (this._val & 0x00ffffff) | ((value << 24) >>> 0);
  }

  // g
  get g(): number {
    return (this._val & 0x00ff0000) >> 16;
  }

  set g(value: number) {
    this._val = (this._val & 0xff00ffff) | (value << 16);
  }

  // b
  get b(): number {
    return (this._val & 0x0000ff00) >> 8;
  }

  set b(value: number) {
    this._val = (this._val & 0xffff00ff) | (value << 8);
  }

  // a
  get a(): number {
    return this._val & 0x000000ff;
  }

  set a(value: number) {
    this._val = (this._val & 0xffffff00) | value;
  }
}

// Expose to globalThis for compatibility with scripts expecting globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Color = Color;

export function color(r?: number | { r: number; g: number; b: number; a?: number } | string, g?: number, b?: number, a?: number): Color {
  if (r === undefined) return new Color(0, 0, 0, 255);
  if (typeof r === 'object') return new Color((r as any).r, (r as any).g, (r as any).b, ((r as any).a == null) ? 255 : (r as any).a);
  if (typeof r === 'string') return hexToColor(r as string);
  return new Color(r as number, g as number, b as number, (a == null ? 255 : a));
}

export function colorEqual(color1: Color, color2: Color): boolean {
  return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

export function hexToColor(hex: string): Color {
  hex = hex.replace(/^#?/, "0x");
  const c = parseInt(hex);
  const r = c >> 16;
  const g = (c >> 8) % 256;
  const b = c % 256;
  return new Color(r, g, b);
}

export function colorToHex(col: Color): string {
  const hR = col.r.toString(16), hG = col.g.toString(16), hB = col.b.toString(16);
  return "#" + (col.r < 16 ? ("0" + hR) : hR) + (col.g < 16 ? ("0" + hG) : hG) + (col.b < 16 ? ("0" + hB) : hB);
}
