export const PALETTES = [
  { bc: 0xe74c3c, hc: 0xf1948a }, { bc: 0x2980b9, hc: 0x7fb3d3 },
  { bc: 0x27ae60, hc: 0x58d68d }, { bc: 0xe67e22, hc: 0xf0b27a },
  { bc: 0x9b59b6, hc: 0xc39bd3 }, { bc: 0x16a085, hc: 0x76d7c4 },
  { bc: 0xc0392b, hc: 0xe57373 }, { bc: 0x2471a3, hc: 0x85c1e9 },
]

export function hashPalette(name) {
  let h = 0
  for (const c of name) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  return PALETTES[Math.abs(h) % PALETTES.length]
}
