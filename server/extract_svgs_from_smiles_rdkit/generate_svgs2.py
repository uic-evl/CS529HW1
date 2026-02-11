from pathlib import Path
import json
from rdkit import Chem
from rdkit.Chem import Draw, AllChem

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_JSON = BASE_DIR / "client" / "public" / "data.json"
SVG_DIR = BASE_DIR / "client" / "public" / "svgs"

def load_compounds(path=DATA_JSON):
    """Load compounds from JSON file."""
    with open(path, 'r') as f:
        return json.load(f)


def generate_svg(smiles, name, output_dir=SVG_DIR):
    """Generate SVG for a given SMILES string and save it in the svg_molecules folder."""
    try:
        # Create molecule from SMILES
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            print(f"Error: Could not parse SMILES for {name}")
            return False
        
        # Create 2D coordinates for the molecule
        AllChem.Compute2DCoords(mol)
        
        # Make sure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate SVG
        svg_filename = output_dir / f"{name}.svg"
        
        # Set drawing options
        Draw.MolToFile(
            mol,
            str(svg_filename),
            size=(400, 400),
            imageType="svg",
            legend=name,
            fitImage=True
        )
        
        return True
    except Exception as e:
        print(f"Error generating SVG for {name}: {str(e)}")
        return False

def enhance_svg_drawing(mol):
    """Add enhanced drawing options for better visualization."""
    # Add 2D coordinates if not present
    if not mol.GetNumConformers():
        AllChem.Compute2DCoords(mol)
    
    # Set drawing options
    opts = Draw.DrawingOptions()
    opts.bondLineWidth = 2.0
    opts.atomLabelFontSize = 12
    opts.includeAtomNumbers = False
    opts.additionalAtomLabelPadding = 0.2
    
    return opts

def main():
    # Load compounds
    compounds = load_compounds()
    print(f"Loaded {len(compounds)} compounds")

    success = 0
    for compound in compounds:
        # Node code writes "smiles" field, not "SMILES"
        smiles = compound.get("smiles")
        name = compound.get("name")
        if smiles and name and generate_svg(smiles, name):
            success += 1

    print(f"Successfully generated {success} SVGs")

if __name__ == "__main__":
    main()
