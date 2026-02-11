import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function HeatmapWithPanel({ compounds, similarityMatrix }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSimilarityPair, setSelectedSimilarityPair] = useState(null);

  const ref = useRef();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  let activeXAxisCompound;
  let activeYAxisCompound;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!compounds?.length || !similarityMatrix?.length) return;

    const n = Math.min(compounds.length, similarityMatrix.length);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 400;
    const height = ref.current.clientHeight || 400;

    const margin = expanded
      ? { top: 40, right: 10, bottom: 10, left: 60 }
      : { top: 10, right: 10, bottom: 10, left: 10 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const indices = d3.range(n);

    const x = d3.scaleBand().domain(indices).range([0, innerWidth]);
    const y = d3.scaleBand().domain(indices).range([0, innerHeight]);

    const data = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        data.push({
          row: i,
          col: j,
          value: similarityMatrix[i][j],
          compRow: compounds[i],
          compCol: compounds[j],
        });
      }
    }

    const color = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.col))
      .attr("y", (d) => y(d.row))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.value));

    // Axis only in expanded mode
    if (expanded) {
      const xLabelTicks = g
        .append("g")
        .selectAll("text")
        .data(indices)
        .join("text")
        .attr("x", (i) => x(i) + x.bandwidth() / 2)
        .attr("y", -20)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("transform", (i) => {
          const xPos = x(i) + x.bandwidth() / 2;
          const yPos = -20;
          return `rotate(-90, ${xPos}, ${yPos})`;
        })
        .style("font-size", "14px")
        .text((i) => `\u00A0-\u00A0`);

      const xLabels = g
        .append("g")
        .selectAll("text")
        .data(indices)
        .join("text")
        .attr("x", (i) => x(i) + x.bandwidth() / 2)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", `16px`)
        .text((i) => "");

      const yLabelTicks = g
        .append("g")
        .selectAll("text")
        .data(indices)
        .join("text")
        .attr("x", -5)
        .attr("y", (i) => y(i) + y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", `14px`)
        .text((i) => `\u00A0-\u00A0`);

      const yLabels = g
        .append("g")
        .selectAll("text")
        .data(indices)
        .join("text")
        .attr("x", -25)
        .attr("y", (i) => y(i) + y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", `16px`)
        .text((i) => "");

      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.col))
        .attr("y", (d) => y(d.row))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", (d) => color(d.value))
        .attr("stroke", (d) =>
          selectedSimilarityPair &&
          selectedSimilarityPair.compRow === d.compRow &&
          selectedSimilarityPair.compCol === d.compCol
            ? "white"
            : null
        )
        .attr("stroke-width", (d) =>
          selectedSimilarityPair &&
          selectedSimilarityPair.compRow === d.compRow &&
          selectedSimilarityPair.compCol === d.compCol
            ? 2.5
            : 0
        )
        .on("mouseover", function (event, d) {
          d3.select(this).attr("stroke", "white").attr("stroke-width", 2.5);
          if (expanded) {
            xLabels.text((i) =>
              i === d.col ? compounds[i].name.slice(-3) : ""
            );
            yLabels.text((i) =>
              i === d.row ? compounds[i].name.slice(-3) : ""
            );
            xLabelTicks.text((i) => (i === d.col ? "---" : "\u00A0-\u00A0"));
            yLabelTicks.text((i) => (i === d.row ? "---" : "\u00A0-\u00A0"));
          }
        })
        .on("mouseout", function (event, d) {
          // Only remove stroke if it's NOT the selected rectangle
          if (
            !selectedSimilarityPair ||
            selectedSimilarityPair.compRow !== d.compRow ||
            selectedSimilarityPair.compCol !== d.compCol
          ) {
            d3.select(this).attr("stroke", null).attr("stroke-width", 0);
          } else {
            // Keep the selected rectangle stroke
            d3.select(this).attr("stroke", "white").attr("stroke-width", 2.5);
          }
          if (expanded) {
            xLabels.text((i) => "");
            yLabels.text((i) => "");
            xLabelTicks.text((i) => `\u00A0-\u00A0`);
            yLabelTicks.text((i) => `\u00A0-\u00A0`);
          }
        })
        .on("click", (event, d) => {
          setSelectedSimilarityPair({
            compRow: d.compRow,
            compCol: d.compCol,
            similarity: d.value,
          });
        });
    }
  }, [
    compounds,
    similarityMatrix,
    selectedSimilarityPair,
    expanded,
    windowSize,
  ]);

  // Helpers
  const formatVal = (v) =>
    v == null || v === "" ? "N/A" : typeof v === "number" ? v.toFixed(3) : v;

  const getSvgFor = (c) => (c?.name ? `/svgs/${c.name}.svg` : null);

  const a = selectedSimilarityPair?.compRow || {};
  const b = selectedSimilarityPair?.compCol || {};

  if (!expanded) {
    return (
      <div className="relative flex flex-col w-full h-full">
        <div className="text-sm font-bold m-0 p-0 text-center border-b border-gray-200 text-gray-400">
          Structural Similarity Heatmap
        </div>

        <button
          onClick={() => setExpanded(true)}
          className="absolute top-0 right-2 px-2 py-1 text-xs rounded bg-white/80 border hover:bg-white"
        >
          Expand
        </button>

        <svg ref={ref} className="w-full h-full"></svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-lg w-[95vw] h-[95vh] p-2 flex flex-col overflow-y-auto overflow-x-hidden">
        <button
          onClick={() => {
            setExpanded(false);
            setSelectedSimilarityPair(null);
          }}
          className="absolute flex items-center justify-center w-[32px] h-[32px] top-2 right-2 z-100 p-0 rounded hover:bg-gray-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
              fill="#000000"
            />
          </svg>
        </button>

        <div className="flex-1 flex">
          <div className="flex-1">
            <svg ref={ref} className="w-full h-full"></svg>
          </div>
          <div className="w-80 h-full p-3 pr-0 text-xs flex flex-col items-center justify-center overflow-y-auto mt-8">
            {!selectedSimilarityPair && (
              <p className="text-gray-500">
                Click a cell in the heatmap to see details here.
              </p>
            )}

            {selectedSimilarityPair && (
              <div className="flex flex-col gap-10 h-full">
                <p className="text-center text-lg">
                  <span className="font-bold">Structural Similarity:</span>{" "}
                  <span>{formatVal(selectedSimilarityPair.similarity)}</span>
                </p>

                {/* Compound A */}
                <div>
                  <h4 className="mb-2 text-center text-[15px]">
                    <b>Compound A (Y-Axis):</b> {a.name || "N/A"}
                  </h4>
                  {getSvgFor(a) && (
                    <img
                      src={getSvgFor(a)}
                      alt={a.name}
                      className="w-full h-auto mb-2 border rounded bg-white object-contain"
                    />
                  )}
                  <div className="flex gap-20">
                    <div className="space-y-1">
                      <p>
                        <span className="font-bold">Weight:</span>{" "}
                        {formatVal(a.weight)}
                      </p>
                      <p>
                        <span className="font-bold">Log P:</span>{" "}
                        {formatVal(a.log_p)}
                      </p>
                      <p>
                        <span className="font-bold">Log D:</span>{" "}
                        {formatVal(a.log_d)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-bold">pKa:</span>{" "}
                        {formatVal(a.pka)}
                      </p>
                      <p>
                        <span className="font-bold">TPSA:</span>{" "}
                        {formatVal(a.tpsa)}
                      </p>
                      <p>
                        <span className="font-bold">Potency:</span>{" "}
                        {formatVal(a.potency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compound B */}
                <div>
                  <h4 className="text-center mb-2 text-[15px]">
                    <b>Compound B (X-Axis):</b> {b.name || "N/A"}
                  </h4>
                  {getSvgFor(b) && (
                    <img
                      src={getSvgFor(b)}
                      alt={b.name}
                      className="w-full h-auto mb-2 border rounded bg-white object-contain"
                    />
                  )}
                  <div className="flex gap-20">
                    <div className="space-y-1">
                      <p>
                        <span className="font-bold">Weight:</span>{" "}
                        {formatVal(b.weight)}
                      </p>
                      <p>
                        <span className="font-bold">Log P:</span>{" "}
                        {formatVal(b.log_p)}
                      </p>
                      <p>
                        <span className="font-bold">Log D:</span>{" "}
                        {formatVal(b.log_d)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-bold">pKa:</span>{" "}
                        {formatVal(b.pka)}
                      </p>
                      <p>
                        <span className="font-bold">TPSA:</span>{" "}
                        {formatVal(b.tpsa)}
                      </p>
                      <p>
                        <span className="font-bold">Potency:</span>{" "}
                        {formatVal(b.potency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
