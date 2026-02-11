import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChart({
  data,
  real_data,
  width = 200,
  height = 120,
  direction = "up",
}) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const barWidth = width / data.length;
    const maxValue = d3.max(data);

    const scale = d3.scaleLinear().domain([0, maxValue]).range([0, height]);

    const group = svg.append("g");

    group
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth + 10)
      .attr("width", barWidth - 20)
      .attr("height", (d) => scale(d))
      .attr("fill", "#3b82f6")
      .attr("y", (d) => (direction === "up" ? height - scale(d) : 0));

    group
      .selectAll("text")
      .data(real_data)
      .enter()
      .append("text")
      .text((d) => d.toFixed(3))
      .attr("x", (d, i) => i * barWidth + barWidth / 2)
      .attr("y", (d, i) =>
        direction === "up" ? height - scale(data[i]) - 4 : scale(data[i]) + 12
      )
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("font-size", "10px")
      .attr("font-weight", "bold");
  }, [data, real_data, width, height, direction]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className="overflow-visible"
    ></svg>
  );
}
