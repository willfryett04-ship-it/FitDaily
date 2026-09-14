export type PaletteColor = { name: string; hex: string; count: number };

const colorLibrary = [
  { name: "Black", hex: "#1f1b18", matches: ["black", "charcoal"] },
  { name: "White", hex: "#fbfaf7", matches: ["white", "ivory", "cream", "off-white", "ecru"] },
  { name: "Grey", hex: "#8a8580", matches: ["grey", "gray", "silver"] },
  { name: "Navy", hex: "#25395c", matches: ["navy", "midnight"] },
  { name: "Blue", hex: "#6c8fb9", matches: ["blue", "denim", "teal"] },
  { name: "Green", hex: "#65795b", matches: ["green", "olive", "sage", "khaki"] },
  { name: "Brown", hex: "#785a43", matches: ["brown", "camel", "tan", "beige", "taupe", "chocolate"] },
  { name: "Red", hex: "#a9534b", matches: ["red", "burgundy", "wine", "maroon"] },
  { name: "Pink", hex: "#d596a5", matches: ["pink", "rose", "blush"] },
  { name: "Purple", hex: "#786792", matches: ["purple", "lilac", "lavender"] },
  { name: "Orange", hex: "#c87842", matches: ["orange", "rust", "terracotta"] },
  { name: "Yellow", hex: "#d3ad52", matches: ["yellow", "mustard", "gold"] },
] as const;

export function buildPalette(colors: Array<string | null>): PaletteColor[] {
  const counts = new Map<string, PaletteColor>();
  for (const color of colors) {
    const normalized = color?.toLowerCase() ?? "";
    const match = colorLibrary.find((entry) => entry.matches.some((word) => normalized.includes(word)));
    if (!match) continue;
    const current = counts.get(match.name) ?? { name: match.name, hex: match.hex, count: 0 };
    current.count += 1;
    counts.set(match.name, current);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function paletteAdvice(palette: PaletteColor[]) {
  const neutrals = palette.filter((color) => ["Black", "White", "Grey", "Navy", "Brown"].includes(color.name));
  const accents = palette.filter((color) => !["Black", "White", "Grey", "Navy", "Brown"].includes(color.name));
  return {
    foundation: neutrals.slice(0, 3),
    accents: accents.slice(0, 3),
  };
}
