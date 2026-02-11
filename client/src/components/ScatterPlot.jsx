// Imported React hooks for managing component state and lifecycle
import { useEffect, useRef, useState } from "react";
// Imported D3.js for data-driven document manipulation
import * as d3 from "d3";

// ScatterPlot component visualizes compound data as a scatter plot using D3.js
// Props:
// - compounds: contains compound objects to plot
// - selectedIds: contains selected compound IDs
// - setSelectedIds: function to update selected IDs
// - scatterPlotDimensions: integer key to select which dimensions to plot
// - setTooltip: function to control tooltip display
export default function ScatterPlot({
  compounds,
  selectedIds,
  setSelectedIds,
  scatterPlotDimensions,
  setTooltip,
}) {
  // Ref to the SVG element for D3 rendering
  const ref = useRef();
  // Tracked window size for responsive rendering
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Updated window size state on resize for responsive chart
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

  //  Renders the scatter plot whenever data, selection, dimensions, or window size changes
  useEffect(() => {
    // If no data present then do nothing
    if (!compounds || compounds.length === 0) return;

    // Map from dimension selector to property pairs for axes
    const dimensionMap = {
      1: ["weight", "log_p"],
      2: ["weight", "log_d"],
      3: ["weight", "pka"],
      4: ["weight", "tpsa"],
      5: ["weight", "potency"],
      6: ["log_p", "log_d"],
      7: ["log_p", "pka"],
      8: ["log_p", "tpsa"],
      9: ["log_p", "potency"],
      10: ["log_d", "pka"],
      11: ["log_d", "tpsa"],
      12: ["log_d", "potency"],
      13: ["pka", "tpsa"],
      14: ["pka", "potency"],
      15: ["tpsa", "potency"],
    };

    // Human-readable axis labels
    const displayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
      potency: "Potency",
    };

    // Have Choosen which properties to plot on x and y axes
    const [xProp, yProp] = dimensionMap[scatterPlotDimensions] || [
      "weight",
      "log_p",
    ];

    // Selected the SVG element for D3 rendering
    const svg = d3.select(ref.current);

    // Cleared previous plot
    svg.selectAll("*").remove();

    // Got SVG dimensions
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    // Margins for axes and labels
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    // Inner drawing area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X scale: linear, based on selected property
    const x = d3
      .scaleLinear()
      .domain(d3.extent(compounds, (d) => +d[xProp]))
      .nice()
      .range([0, innerWidth]);

    // Y scale: linear, based on selected property
    const y = d3
      .scaleLinear()
      .domain(d3.extent(compounds, (d) => +d[yProp]))
      .nice()
      .range([innerHeight, 0]);

    // Main group for plot, shifs by margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Have Drawn circles for each compound
    g.selectAll("circle")
      .data(compounds)
      .join("circle")
      // X position based on x property
      .attr("cx", (d) => x(+d[xProp]))
      // Y position based on y property
      .attr("cy", (d) => y(+d[yProp]))
      .attr("r", 5)
      // Color: orange if selected, steelblue otherwise
      .attr("fill", (d) =>
        selectedIds.includes(d.ID) ? "orange" : "steelblue"
      )
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      // On Click: toggles selection of compound
      .on("click", (event, d) => {
        if (selectedIds.includes(d.ID)) {
          setSelectedIds(selectedIds.filter((id) => id !== d.ID));
        } else {
          setSelectedIds([...selectedIds, d.ID]);
        }
      })
      // Mouseover: to show tooltip with compound info
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          compound: d,
        });
      })
      // Mousemove: updates tooltip position
      .on("mousemove", (event) => {
        setTooltip((prev) => ({ ...prev, x: event.pageX, y: event.pageY }));
      })
      // Mouseout: hides tooltip
      .on("mouseout", () => {
        setTooltip({ visible: false, x: 0, y: 0, compound: null });
      });

    // Have Drawn x-axis and label
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(displayNames[xProp]);

    // Have Drawn y-axis and label
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(displayNames[yProp]);
  }, [compounds, selectedIds, scatterPlotDimensions, windowSize]);

  // Rendered SVG element for D3 to use
  return (
    <div className="flex flex-col w-full h-full">
      <div className="text-sm font-bold m-0 p-0 text-center border-b border-gray-200 text-gray-400">
        Scatter Chart
      </div>
      <svg ref={ref} className="w-full h-full"></svg>
    </div>
  );
}
