import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// To get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputFile = path.join(__dirname, "all_compound_part_a_svgs.txt");
const outputFolder = path.join(__dirname, "part_a_extracted_svgs");
const jsonFile = path.join(__dirname, "data.json");

// Create folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Read SVG file
const data = fs.readFileSync(inputFile, "utf-8");

// Read and parse JSON
const jsonData = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));

// Extract names array
const names = jsonData.map((obj) => obj.name);

// Match all SVG blocks
const svgMatches = data.match(/<svg[\s\S]*?<\/svg>/g);

if (!svgMatches) {
  console.log("No SVGs found in the file.");
  process.exit();
}

if (svgMatches.length !== names.length) {
  console.warn(
    `WARNING: SVG count (${svgMatches.length}) does not match JSON name count (${names.length}).`
  );
  console.warn(
    "Files will still be saved, unmatched ones will use numeric names.\n"
  );
}

// Save each SVG
svgMatches.forEach((svgContent, index) => {
  // Use name if exists, else fallback to index
  const baseName = names[index] ? names[index] : `svg_${index + 1}`;

  // Make filename safe (remove illegal characters)
  const safeName = baseName.replace(/[<>:"/\\|?*]/g, "_");

  const filePath = path.join(outputFolder, `${safeName}.svg`);

  fs.writeFileSync(filePath, svgContent, "utf-8");
  console.log(`Saved ${filePath}`);
});

console.log(`\nTotal SVGs saved: ${svgMatches.length}`);
