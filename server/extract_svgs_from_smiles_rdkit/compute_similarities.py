from pathlib import Path
import json
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_JSON = BASE_DIR / "client" / "public" / "data.json"
OUT_JSON = BASE_DIR / "client" / "public" / "similarities.json"

def load_compounds(path=DATA_JSON):
    """Load compounds from JSON file."""
    with open(path, 'r') as f:
        return json.load(f)

def calculate_similarity_matrix(compounds):
    similarity_data = {}
    mols = []
    fps = []
    valid_compounds = []

    print("Processing molecules for fingerprinting...")
    for c in compounds:
        smiles = c.get("smiles")
        name = c.get("name")
        if not smiles or not name:
            continue

        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            continue

        mols.append(mol)
        fps.append(AllChem.GetMorganFingerprintAsBitVect(mol, 2))
        valid_compounds.append(c)

    print(f"Calculating similarities for {len(valid_compounds)} compounds...")

    for i in range(len(fps)):
        current_name = valid_compounds[i]["name"]
        similarity_data[current_name] = []

        for j in range(len(fps)):
            if i == j:
                continue
            sim = DataStructs.TanimotoSimilarity(fps[i], fps[j])
            similarity_data[current_name].append({
                "compound": valid_compounds[j]["name"],
                "similarity": float(sim),
            })

        similarity_data[current_name].sort(
            key=lambda x: x["similarity"],
            reverse=True
        )

    return similarity_data

def main():
    compounds = load_compounds()
    print(f"Loaded {len(compounds)} compounds")

    similarity_data = calculate_similarity_matrix(compounds)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(similarity_data, f, indent=2)

    print(
        f"Saved similarity data for {len(similarity_data)} compounds to {OUT_JSON}"
    )

if __name__ == "__main__":
    main()
