// Same approach as the frontend's src/utils/placeholderImage.js: a themed inline
// SVG data URI per category, used only to seed sample data with something to show.

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

export function categoryImage(category, label = "") {
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
  <text x="400" y="250" font-size="120" text-anchor="middle" dominant-baseline="middle">${theme.icon}</text>
  <text x="400" y="360" font-size="30" font-family="Georgia, serif" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.92">${escapeXml(
    label || category
  )}</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
