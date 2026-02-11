import fs from "fs";
import path from "path";
import RDKit from "@rdkit/rdkit";

const __dirname = path.resolve();
const input = path.join(__dirname, "./generate_similarities/data.json");
const output = path.join(
  __dirname,
  "./generate_similarities/similarities.json"
);

// Compute Tanimoto similarity between two bit strings
function tanimoto(fp1, fp2) {
  if (fp1.length !== fp2.length) throw new Error("FP lengths differ");

  let a = 0;
  let b = 0;
  let c = 0;

  for (let i = 0; i < fp1.length; i++) {
    const bit1 = fp1[i] === "1";
    const bit2 = fp2[i] === "1";
    if (bit1 && bit2) a++;
    else if (bit1 && !bit2) b++;
    else if (!bit1 && bit2) c++;
  }
  return a / (a + b + c);
}

async function main() {
  const RDKitInstance = await RDKit();
  console.log("RDKit initialized!");

  const compounds = JSON.parse(fs.readFileSync(input, "utf-8"));
  console.log(`Loaded ${compounds.length} compounds`);

  const fingerprints = [];
  const names = [];

  // Generate fingerprints
  for (const c of compounds) {
    if (!c.smiles || !c.name) continue;

    const mol = RDKitInstance.get_mol(c.smiles);
    names.push(c.name);

    const fingerprint = mol.get_morgan_fp("2");
    fingerprints.push(fingerprint);
  }

  const simData = {};

  // Compute similarity manually
  for (let i = 0; i < fingerprints.length; i++) {
    simData[names[i]] = [];

    for (let j = 0; j < fingerprints.length; j++) {
      if (i === j) continue;

      const sim = tanimoto(fingerprints[i], fingerprints[j]);
      simData[names[i]].push({ compound: names[j], similarity: sim });
    }

    // Sort descending by similarity
    simData[names[i]].sort((a, b) => b.similarity - a.similarity);
  }

  fs.writeFileSync(output, JSON.stringify(simData, null, 2), "utf-8");
  console.log("Saved similarities to:", output);
}

main();
