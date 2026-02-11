// Tooltip component to show compound details on hover

export default function Tooltip({ visible, x, y, compound }) {
  if (!visible || !compound) return null;

  const displayNames = {
    weight: "Weight",
    log_p: "Log P",
    log_d: "Log D",
    pka: "pKa",
    tpsa: "TPSA",
    potency: "Potency",
  };

  return (
    <div
      className="
        absolute bg-white border border-gray-300 rounded-lg p-3 shadow-lg
        pointer-events-none min-w-[400px] max-w-[400px] z-[1000]
      "
      style={{
        left: x + 10,
        top: y + 10,
      }}
    >
      <div className="flex w-full">
        <div className="w-1/3">
          <div className="font-bold">{compound.name}</div>

          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(compound).map(([key, value]) => {
              if (
                key === "ID" ||
                key === "name" ||
                key === "smiles" ||
                key === "potency_string" ||
                key === "synonyms" ||
                key === "part_a_smiles" ||
                key === "part_b_smiles" ||
                key === "part_c_smiles" ||
                key === "mean_potency_part_a" ||
                key === "mean_potency_part_b" ||
                key === "mean_potency_part_c" ||
                key === "frequency_part_a" ||
                key === "frequency_part_b" ||
                key === "frequency_part_c"
              )
                return null;

              return (
                <li key={key} className="flex gap-1">
                  <span className="font-semibold">
                    {displayNames[key] || key}:
                  </span>

                  <span className="ml-2">{value}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-2/3 flex justify-center items-center">
          <img
            src={`/svgs/${compound.name}.svg`}
            alt={compound.name || `Compound ${compound.ID}`}
            className="object-contain"
          />
        </div>
      </div>

      <ul className="mt-2 space-y-1 text-sm">
        <li className="flex gap-1">
          <span className="font-semibold">Synonyms:</span>
          <div className="ml-2 block w-full break-all">{compound.synonyms}</div>
        </li>
        <li className="flex gap-1">
          <span className="font-semibold">SMILES:</span>
          <div className="ml-2 block w-full break-all">{compound.smiles}</div>
        </li>
      </ul>
    </div>
  );
}
