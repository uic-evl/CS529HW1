import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

// ---- Bounding box helpers ----
function getBoundsFromLine(line) {
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  const x2 = parseFloat(line.getAttribute("x2"));
  const y2 = parseFloat(line.getAttribute("y2"));
  return {
    minX: Math.min(x1, x2),
    maxX: Math.max(x1, x2),
    minY: Math.min(y1, y2),
    maxY: Math.max(y1, y2),
  };
}

function getBoundsFromCircle(c) {
  const cx = parseFloat(c.getAttribute("cx"));
  const cy = parseFloat(c.getAttribute("cy"));
  const r = parseFloat(c.getAttribute("r"));
  return { minX: cx - r, maxX: cx + r, minY: cy - r, maxY: cy + r };
}

function getBoundsFromRect(r) {
  const x = parseFloat(r.getAttribute("x"));
  const y = parseFloat(r.getAttribute("y"));
  const w = parseFloat(r.getAttribute("width"));
  const h = parseFloat(r.getAttribute("height"));
  return { minX: x, maxX: x + w, minY: y, maxY: y + h };
}

function mergeBounds(a, b) {
  return {
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minY: Math.min(a.minY, b.minY),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

// ---- Crop a single SVG ----
function cropSVG(svgContent) {
  const dom = new JSDOM(svgContent, { contentType: "image/svg+xml" });
  const document = dom.window.document;

  const elements = [
    ...document.querySelectorAll("line"),
    ...document.querySelectorAll("circle"),
    ...document.querySelectorAll("rect"),
  ];

  if (elements.length === 0) return svgContent;

  let bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };

  for (const el of elements) {
    let b;
    if (el.tagName === "line") b = getBoundsFromLine(el);
    if (el.tagName === "circle") b = getBoundsFromCircle(el);
    if (el.tagName === "rect") b = getBoundsFromRect(el);
    if (b) bounds = mergeBounds(bounds, b);
  }

  // padding to avoid clipping
  const padding = 15;
  bounds.minX -= padding;
  bounds.minY -= padding;
  bounds.maxX += padding;
  bounds.maxY += padding;

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  const svg = document.querySelector("svg");
  svg.setAttribute(
    "viewBox",
    `${bounds.minX} ${bounds.minY} ${width} ${height}`
  );

  return dom.serialize();
}

// ---- Process folder ----
const folder = process.argv[2];

if (!folder) {
  console.error("❌ Usage: node crop-all-svgs.mjs <folder_path>");
  process.exit(1);
}

const files = fs
  .readdirSync(folder)
  .filter((f) => f.toLowerCase().endsWith(".svg"));

console.log(`Found ${files.length} SVG files.\n`);

for (const file of files) {
  const fullPath = path.join(folder, file);
  const original = fs.readFileSync(fullPath, "utf8");
  const cropped = cropSVG(original);
  fs.writeFileSync(fullPath, cropped, "utf8");
  console.log("✔ Cropped:", file);
}

console.log("\n🎉 All SVGs processed.");
