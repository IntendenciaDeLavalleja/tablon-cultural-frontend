export type EventItem = {
  id: string;
  title: string;
  locality: string;
  address?: string;
  datetime: string;
  description?: string;
  image?: string;
  category?: string;
};

export type Placement = {
  id: string;
  top: number; // percentage
  left: number; // percentage
  rotate: number; // degrees
};

// Simple hash function to generate a seed from a string
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generatePlacements(events: EventItem[]): Placement[] {
  // Create a stable seed based on the concatenation of all event IDs
  const seedString = events.map(e => e.id).join('');
  const seed = cyrb128(seedString)[0];
  const random = mulberry32(seed);

  const placements: Placement[] = [];
  const cardWidth = 22; // Estimated width in %
  const cardHeight = 25; // Estimated height in %
  const padding = 2; // Padding from edges in %

  events.forEach(event => {
    let bestTop = 0;
    let bestLeft = 0;
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 50) {
      // Generate random position within bounds
      const top = padding + random() * (100 - cardHeight - padding * 2);
      const left = padding + random() * (100 - cardWidth - padding * 2);

      // Check collision with existing placements
      let collision = false;
      for (const p of placements) {
        const distH = Math.abs(p.left - left);
        const distV = Math.abs(p.top - top);
        
        // Simple box collision check (with some margin)
        if (distH < cardWidth * 0.8 && distV < cardHeight * 0.8) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        bestTop = top;
        bestLeft = left;
        valid = true;
      }
      attempts++;
    }

    // If we couldn't find a spot, just place it randomly (or could fallback to grid)
    if (!valid) {
       bestTop = padding + random() * (100 - cardHeight - padding * 2);
       bestLeft = padding + random() * (100 - cardWidth - padding * 2);
    }

    placements.push({
      id: event.id,
      top: bestTop,
      left: bestLeft,
      rotate: (random() - 0.5) * 10 // Random rotation between -5 and 5 deg
    });
  });

  return placements;
}
