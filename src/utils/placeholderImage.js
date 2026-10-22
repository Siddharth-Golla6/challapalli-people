// Generates themed inline-SVG images (as data URIs) for problem categories.
// Avoids hotlinking external stock photos — those are fragile
// on the low-bandwidth/rural networks this app targets, and this sandbox's
// network policy can't even verify hotlinked URLs resolve. Fully offline,
// zero broken-image risk, and still visually distinct per category.

const THEMES = {
  "Roads & Transport": { from: "#4B5563", to: "#1F2937", icon: "🛣️" },
  "Water Supply": { from: "#0EA5E9", to: "#075985", icon: "💧" },
  Electricity: { from: "#F59E0B", to: "#B45309", icon: "⚡" },
  "Sanitation & Waste": { from: "#65A30D", to: "#3F6212", icon: "🗑️" },
  Drainage: { from: "#0891B2", to: "#164E63", icon: "🌊" },
  "Public Health": { from: "#DC2626", to: "#7F1D1D", icon: "🏥" },
  Education: { from: "#7C3AED", to: "#4C1D95", icon: "🏫" },
  "Street Lighting": { from: "#EAB308", to: "#854D0E", icon: "💡" },
  Default: { from: "#D32F2F", to: "#B02525", icon: "📍" },
};

export const categoryImage = (category, label = "") => {
  const theme = THEMES[category] || THEMES.Default;
  const id = `g-${category.replace(/[^a-zA-Z0-9]/g, "")}`;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#${id})"/>
  <circle cx="680" cy="80" r="140" fill="#ffffff" opacity="0.06"/>
  <circle cx="90" cy="440" r="110" fill="#ffffff" opacity="0.06"/>
  <text x="400" y="250" font-size="120" text-anchor="middle" dominant-baseline="middle">${theme.icon}</text>
  <text x="400" y="360" font-size="30" font-family="Georgia, serif" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.92">${escapeXml(
    label || category
  )}</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const landingBackgroundDataUri = () => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF7DC"/>
      <stop offset="55%" stop-color="#FFC107"/>
      <stop offset="100%" stop-color="#D32F2F"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#skyGrad)"/>
  <circle cx="1600" cy="220" r="140" fill="#ffffff" opacity="0.35"/>
  <path d="M0 780 L200 700 L420 800 L680 660 L960 780 L1260 680 L1560 800 L1920 720 L1920 1080 L0 1080 Z" fill="#B02525" opacity="0.55"/>
  <path d="M0 860 L260 820 L520 880 L820 800 L1100 870 L1440 810 L1920 860 L1920 1080 L0 1080 Z" fill="#7F1D1D" opacity="0.75"/>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
