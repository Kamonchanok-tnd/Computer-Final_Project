// URL utils
export const apiUrl = import.meta.env.VITE_API_URL as string;

export const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;

export function buildImageSrc(picture: string): string {
  if (!picture) return "";
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) return joinUrl(apiUrl, picture);
  return joinUrl(apiUrl, `images/emoji/${picture}`);
}

// RNG utilities (deterministic)
export function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian01(rng: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
