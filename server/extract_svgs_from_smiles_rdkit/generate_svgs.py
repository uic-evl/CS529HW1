import json
import os
from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem import AllChem
from rdkit.Chem import DataStructs
import numpy as np

def load_compounds(json_file):
    """Loaded compounds from JSON file."""
    with open(json_file, 'r') as f:
        return json.load(f)

def generate_svg(smiles, name, output_dir='generated_svgs'):
    """Generated SVG for a given SMILES string and saves it in the folder."""
    try:
        # Created molecule from SMILES
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            print(f"Error: Could not parse SMILES for {name}")
            return False
        
        # Created 2D coordinates for the molecule
        AllChem.Compute2DCoords(mol)
        
        # Made sure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Generated SVG
        svg_filename = os.path.join(output_dir, f"{name}.svg")
        
        # Have Set drawing options
        Draw.MolToFile(
            mol,
            svg_filename,
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
    # Added 2D coordinates if not present
    if not mol.GetNumConformers():
        AllChem.Compute2DCoords(mol)
    
    # Have Set drawing options
    opts = Draw.DrawingOptions()
    opts.bondLineWidth = 2.0
    opts.atomLabelFontSize = 12
    opts.includeAtomNumbers = False
    opts.additionalAtomLabelPadding = 0.2
    
    return opts

def calculate_similarity_matrix(compounds):
    """Calculated similarity matrix for all compounds."""
    n = len(compounds)
    similarity_data = {}
    
    # Converted SMILES to molecules and fingerprints
    mols = []
    fps = []
    valid_compounds = []
    
    print("Processing molecules...")
    for compound in compounds:
        mol = Chem.MolFromSmiles(compound['SMILES'])
        if mol is not None:
            mols.append(mol)
            fps.append(AllChem.GetMorganFingerprintAsBitVect(mol, 2))
            valid_compounds.append(compound)
    
    print(f"Calculating similarities for {len(valid_compounds)} compounds...")
    # Calculated similarities for each compound against all others
    for i in range(len(fps)):
        compound_similarities = []
        current_name = valid_compounds[i]['name']
        similarity_data[current_name] = []
        
        # Calculated similarity with all other compounds
        for j in range(len(fps)):
            if i != j:  # Entered condition to compare molecule with itself
                similarity = DataStructs.TanimotoSimilarity(fps[i], fps[j])
                similarity_data[current_name].append({
                    'compound': valid_compounds[j]['name'],
                    'similarity': float(similarity)
                })
        
        # Sorted similarities for this compound by value (descending)
        similarity_data[current_name].sort(key=lambda x: x['similarity'], reverse=True)
        
        if (i + 1) % 10 == 0:
            print(f"Processed {i + 1}/{len(fps)} compounds...")
    
    return similarity_data

def main():
    # Have Loaded compounds
    compounds = load_compounds('compounds.json')
    print(f"Loaded {len(compounds)} compounds")
    
    # Generated SVGs
    success_count = 0
    for compound in compounds:
        if generate_svg(compound['SMILES'], compound['name']):
            success_count += 1
    print(f"Successfully generated {success_count} SVGs")
    
    # Calculated similarities and save to JSON
    similarity_data = calculate_similarity_matrix(compounds)
    
    # Saved complete similarity data
    with open('similarities.json', 'w') as f:
        json.dump(similarity_data, f, indent=2)
    
    total_comparisons = sum(len(similarities) for similarities in similarity_data.values())
    print(f"Generated similarity data for {len(similarity_data)} compounds ({total_comparisons} total comparisons)")
    
    # Have Printed some statistics
    print("\nSample similarity data for first compound:")
    first_compound = next(iter(similarity_data))
    print(f"Most similar compounds to {first_compound}:")
    for similar in similarity_data[first_compound][:5]:
        print(f"  {similar['compound']}: {similar['similarity']:.3f}")

if __name__ == '__main__':
    main()
