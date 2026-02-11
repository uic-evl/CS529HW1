
# Interactive Visualization of Structure-Activity Relationships in Antimalarial Compounds

### Project Repository: https://github.com/pleaselukau/SAR-Visualization

### Deployed Application: https://sar-visualization.onrender.com/

## CS 529: Visual Data Science (VDS) - Fall 2025

**University of Illinois Chicago (UIC)**

-----

## Team

  * **Project Manager:** Please Lukau
  * **Team Members:** Harsh Shelke, Hrushikesh Joshi
  * **Clients:** Dr. Kevin A. Kunz and Prof. Paul R. Carlier (UICentre)

-----

## Project Overview

This project is an interactive, browser-based visualization system designed to help medicinal chemists explore **Structure-Activity Relationships (SAR)** in a real-world drug discovery dataset. The system visualizes antimalarial compounds sharing a common **ß-carboline** molecular backbone, allowing researchers to detect patterns, clusters, and outliers by linking a compound's measured antimalarial potency with its calculated physicochemical properties and 2D chemical structure.

The visualization integrates chemical structure rendering and similarity computations directly into the visual analysis, helping guide decisions on which compounds are most promising for future synthesis.

-----

## Key Features

  * **Interactive Scatter Plot:** Explore correlations between any two chemical properties (Weight, Log P, Log D, pKa, TPSA, Potency) with 15 different dimension combinations. Click compounds to select/highlight them across all views.
  
  * **Parallel Coordinates Plot:** View all compounds across multiple dimensions simultaneously. Interactive brushing allows filtering compounds by property ranges. Selected compounds are highlighted in orange.
  
  * **Radar Chart (Spider Plot):** Compare selected compounds across all six properties in a radial visualization, showing how multiple compounds overlap in chemical space.
  
  * **Structural Similarity Heatmap:** Visualize pairwise structural similarities between all compounds using Tanimoto similarity computed from Morgan fingerprints. Click cells to view detailed comparison of compound pairs. Expand to full-screen view for detailed exploration.
  
  * **Selection Panel:** Browse all compounds with their 2D molecular structures, properties, and select compounds for highlighting or comparison. Switch between "Highlight" mode (multiple selections) and "Compare" mode (max 2 compounds).
  
  * **Comparison Panel:** Side-by-side view of up to 2 selected compounds for detailed comparison.
  
  * **Coordinated & Linked Views:** Selecting a compound in any view instantly highlights it across all other visualizations with coordinated colors (orange for selected, steelblue for unselected).
  
  * **Interactive Tooltips:** Hover over compounds in scatter plots and parallel coordinates to see detailed property information.
  
  * **Dynamic Filtering & Brushing:** Use interactive brushes in the parallel coordinates plot to filter compounds by property ranges, with automatic visual feedback across all views.

-----

## Technology Stack

  * **Frontend Framework:** **React** with **Vite** for fast development and building
  * **Visualization Library:** **D3.js** (for all interactive graphics and plots)
  * **Styling:** **Tailwind CSS** for responsive UI design
  * **Data Processing & Backend:** **Python** with **RDKit** for cheminformatics computations
  * **Cheminformatics:** **RDKit** (used for processing SMILES, computing molecular fingerprints/properties, and rendering 2D structures as SVGs)

-----

## Data

The dataset, originally provided by the Carlier laboratory at UIC as an Excel file, contained 105 compounds. After data cleaning (which removed 10 rows with invalid potency values), the final dataset used for visualization contains **95 compounds**.

The key data fields in `data.json` are:

  * **`name`**: The unique compound identifier (e.g., `CAR-0000058`).
  * **`ID`**: The compound ID used for selection and filtering.
  * **`smiles`**: The chemical structure in SMILES notation (a text format).
  * **`potency`**: The measured antimalarial potency (pEC50, the target variable for visualization).
  * **Five computed physicochemical properties**:
      * `weight` (Molecular Weight)
      * `log_p` (Log P, a measure of lipophilicity)
      * `log_d` (Log D)
      * `pka` (Acid dissociation constant)
      * `tpsa` (Topological Polar Surface Area)

The `similarities.json` file contains pairwise structural similarity scores computed using Tanimoto similarity on Morgan fingerprints (radius 2), stored as a dictionary mapping each compound name to a list of similar compounds with their similarity scores.

-----

## Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher recommended) and **npm**
- **Python 3.7+** (for computing structural similarities)
- **RDKit** Python package (for cheminformatics computations)

### Installing Node.js and npm

Install Node.js from the official site: https://nodejs.org/en/download

During installation, npm will also be installed. Verify installations:

```bash
node -v
npm -v
```

#### Optional: Using Node Version Manager (NVM)

For Ubuntu/Linux or macOS, consider using NVM: https://github.com/nvm-sh/nvm

```bash
nvm install 18
nvm use 18
```

### Getting the Code

Clone the repository:

```bash
git clone https://github.com/pleaselukau/SAR-Visualization
cd SAR-Visualization
```

### Installing Dependencies

#### Frontend (Client)

```bash
cd client
npm install
```

#### Backend (Server - Optional, for computing similarities)

```bash
cd server
# Install RDKit (requires conda or pip)
# Using conda (recommended):
conda create -n rdkit-env python=3.9
conda activate rdkit-env
conda install -c conda-forge rdkit

# Or using pip (if RDKit wheels are available for your platform):
pip install rdkit
```

### Running the Application

#### Development Mode

From the `client` directory:

```bash
npm run dev
```

This launches the Vite development server (typically at `http://localhost:5173/`). Hot reload is enabled.

#### Computing Structural Similarities (Optional)

There are two scripts available for computing structural similarities:

**Option 1: Using `compute_similarities.py` (Recommended for production)**

```bash
cd server
python compute_similarities.py
```

This reads `client/public/data.json` and generates `client/public/similarities.json`.

**Option 2: Using `Generated_SVGS_Script/automate_svgs.py` (All-in-one script)**

This script both generates SVG files and computes similarity matrices:

```bash
cd server/Generated_SVGS_Script
# Ensure RDKit is installed in your environment
python automate_svgs.py
```

This script:
- Generates 2D molecular structure SVGs from SMILES strings (saved to `generated_svgs/`)
- Computes pairwise structural similarities using Tanimoto similarity on Morgan fingerprints
- Saves similarity data to `similarities.json`
- Uses `compounds.json` as input (which should contain compounds with `SMILES` and `name` fields)

**Note:** The `Generated_SVGS_Script` folder contains pre-generated SVGs and similarity data that can be copied to the `client/public/` directory if needed.

### Project Structure

```
SAR-Visualization/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── components/       # React visualization components
│   │   │   ├── ScatterPlot.jsx
│   │   │   ├── ParallelCoordiantePlot.jsx
│   │   │   ├── RadarChart.jsx
│   │   │   ├── Heatmap.jsx
│   │   │   ├── SelectionPanel.jsx
│   │   │   ├── ComparisonPanel.jsx
│   │   │   └── Tooltip.jsx
│   │   ├── index.jsx         # React entry point
│   │   └── index.css         # Global styles
│   ├── public/
│   │   ├── data.json         # Compound data
│   │   ├── similarities.json # Structural similarity matrix
│   │   └── svgs/             # Pre-rendered 2D molecular structures
│   ├── package.json
│   └── vite.config.js        # Vite configuration
│
└── server/                    # Python backend scripts
    ├── compute_similarities.py  # Generate similarity matrix from SMILES
    ├── generate_svgs.py         # Generate SVG structures (if needed)
    ├── data.xlsx                # Original Excel data file
    └── Generated_SVGS_Script/  # Automated SVG generation and similarity computation
        ├── automate_svgs.py     # Main script: generates SVGs and computes similarities
        ├── compounds.json       # Compound data in JSON format
        ├── compound_similarities.json  # Pre-computed similarity matrix
        ├── generated_svgs/      # Generated 2D molecular structure SVGs
        └── rdkit-env/           # Python virtual environment (conda/venv)
```


-----

## Server Scripts

### Generated_SVGS_Script

The `server/Generated_SVGS_Script/` folder contains an automated pipeline for generating molecular structure visualizations and computing structural similarities. This is a comprehensive script that handles both SVG generation and similarity computation in one workflow.

#### Purpose

The `automate_svgs.py` script performs two main tasks:

1. **SVG Generation**: Converts SMILES strings to 2D molecular structure SVGs using RDKit
   - Generates high-quality SVG files (400x400px) for each compound
   - Saves SVGs to the `generated_svgs/` directory
   - Files are named using the compound name (e.g., `CAR-0000058.svg`)

2. **Similarity Computation**: Calculates pairwise structural similarities
   - Uses Morgan fingerprints (radius 2) for molecular representation
   - Computes Tanimoto similarity between all compound pairs
   - Sorts similarities in descending order for each compound
   - Saves results to `similarities.json`

#### Usage

```bash
cd server/Generated_SVGS_Script

# Activate your RDKit environment (if using conda)
conda activate rdkit-env

# Run the script
python automate_svgs.py
```

#### Input Format

The script expects `compounds.json` with the following structure:

```json
[
  {
    "name": "CAR-0000058",
    "SMILES": "CCOc1cc2c(cc1OC)nc(n2)Nc3ccc(cc3)Cl"
  },
  ...
]
```

#### Output

- **SVG Files**: Generated in `generated_svgs/` directory
- **Similarity Data**: Saved as `similarities.json` with format:
  ```json
  {
    "CAR-0000058": [
      {"compound": "CAR-0000059", "similarity": 0.85},
      ...
    ],
    ...
  }
  ```

#### Integration

The generated SVGs can be copied to `client/public/svgs/` for use in the frontend application. The similarity data can be used to update `client/public/similarities.json`.

-----

## Usage Guide

### Selecting Compounds

- **Click** on any compound in the Scatter Plot, Parallel Coordinates Plot, or Selection Panel to select it
- Selected compounds are highlighted in **orange** across all views
- Use the **Selection Panel** to browse and select compounds by name or properties

### Changing Scatter Plot Dimensions

Use the dropdown in the **Selection Panel** to choose which two properties to plot on the X and Y axes. Available combinations include:
- Weight vs Log P, Log D, pKa, TPSA, or Potency
- Log P vs Log D, pKa, TPSA, or Potency
- Log D vs pKa, TPSA, or Potency
- pKa vs TPSA or Potency
- TPSA vs Potency

### Filtering in Parallel Coordinates

- **Drag** vertically on any axis in the Parallel Coordinates Plot to create a brush filter
- Compounds outside the selected range are faded out
- Multiple filters can be active simultaneously
- **Click** outside the brush area to clear a filter

### Exploring Structural Similarity

- The **Heatmap** shows pairwise structural similarities (Tanimoto similarity from Morgan fingerprints)
- **Click** the "Expand" button to view the full-size heatmap
- **Click** any cell in the expanded heatmap to see detailed comparison of the two compounds
- The side panel shows molecular structures, properties, and similarity score

### Comparison Mode

- Switch to **"Compare"** mode in the Selection Panel
- Select up to 2 compounds to compare side-by-side in the Comparison Panel
- The Comparison Panel displays large molecular structure views for easy visual comparison

-----

## Credits

This project was developed for CS 529: Visual Data Science at the University of Illinois Chicago. Support code was written by Andrew Wentzel, Electronic Visualization Laboratory (EVL) at UIC, and adapted for this repository.
