import React, { useEffect, useMemo, useRef } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

// change the code below to modify the bottom plot view
export default function WhiteHatStats(props){
  // this is a generic component for plotting a d3 plot
  const d3Container = useRef(null);

  // this automatically constructs an svg canvas the size of the parent container (height and width)
  // tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
  // this will automatically resize when the window changes so passing svg to a useEffect will re-trigger
  const [svg, height, widthFromHook, tTip] = useSVGCanvas(d3Container);

  const FONT = '"Times New Roman", Times, serif';
  const COLORS = {
    male:        '#2c7ebb',
    maleHover:   '#256B9F',
    female:      '#45ab5e',
    femaleHover: '#3B9150'
  };
  const clean = (s) => String(s ?? '').trim().replace(/\s+/g,'_');
  const MAX_SHOW = 25; // show at most 25 cities

  // we can edit it to also use props.brushedState if you want to use linking

  const activeKey = useMemo(() => (
    props.brushedState ? clean(props.brushedState) :
    props.zoomedState  ? clean(props.zoomedState)  :
    null
  ), [props.brushedState, props.zoomedState]);

  // TODO: modify or replace the code below to draw a more truthful or insightful representation of the dataset.
  // This other representation could be a histogram, a stacked bar chart, etc.
  // (This implementation uses a stacked bar chart of Male/Female by city.)

  useEffect(() => {
    // wait until the data loads
    if (!svg || !props.data) return;

    // Use the wrapper’s actual width so the SVG fills the parent
    const parentW = d3Container.current?.clientWidth || widthFromHook || window.innerWidth;

    const OUTER_H = 380;
    const OUTER_W = Math.max(960, parentW);
    const margin  = { top: 58, right: 140, bottom: 96, left: 80 };

    svg.selectAll('*').remove();
    svg.attr('height', OUTER_H);
    svg.attr('width',  OUTER_W);

    const states = props.data.states || [];
    const cities = props.data.cities || [];

    const toNum = (x) => (x == null ? NaN : +x);
    const maleOf   = (d) => (Number.isFinite(toNum(d?.male_count))   ? +d.male_count   : NaN);
    const femaleOf = (d) => (Number.isFinite(toNum(d?.female_count)) ? +d.female_count : NaN);
    const totalOf  = (d) => (Number.isFinite(toNum(d?.count))        ? +d.count        : NaN);

    // TODO: consider computing values differently if the raw data schema changes
    const inferMale   = (d) => Number.isFinite(maleOf(d))   ? maleOf(d)
                             : (Number.isFinite(totalOf(d)) && Number.isFinite(femaleOf(d)))
                               ? (totalOf(d) - femaleOf(d)) : NaN;
    const inferFemale = (d) => Number.isFinite(femaleOf(d)) ? femaleOf(d)
                             : (Number.isFinite(totalOf(d)) && Number.isFinite(maleOf(d)))
                               ? (totalOf(d) - maleOf(d))   : NaN;

    // change the title (raw example did a scatter title; here we use a chart title/subtitle)
    let titleText = 'Gun Deaths by Gender';
    let subTitle  = 'United States (all states)';
    let chartData = null;


    if (activeKey) {
      const stateCities = cities
        .filter(c => clean(c.state) === activeKey)
        .map(c => {
          const male   = inferMale(c);
          const female = inferFemale(c);
          const total  = Number.isFinite(totalOf(c)) ? totalOf(c)
                        : (Number.isFinite(male) && Number.isFinite(female)) ? male + female
                        : NaN;
          return {
            city: c.city,
            male:  Number.isFinite(male)   ? male   : 0,
            female:Number.isFinite(female) ? female : 0,
            total: Number.isFinite(total)  ? total  : ((Number.isFinite(male)?male:0) + (Number.isFinite(female)?female:0))
          };
        })
        .filter(d => d.total > 0);

      if (stateCities.length > 0) {
        // sort by total desc, take Top-25, then sort that subset alphabetically
        // (raw file: “we can edit it to also use props.brushedState if you want to use linking”)
        const topSubset = stateCities
          .sort((a,b) => d3.descending(a.total, b.total))
          .slice(0, MAX_SHOW)
          .sort((a,b) => d3.ascending(a.city, b.city)); // ← alphabetical display

        chartData = topSubset;

        const printable = (props.brushedState || props.zoomedState || '').replace(/_/g,' ');
        subTitle = (stateCities.length > MAX_SHOW)
          ? `Top ${MAX_SHOW} Cities in ${printable} (selected from ${stateCities.length})`
          : `${printable}`;
      }
    }


    if (!chartData) {
      const maleAll   = d3.sum(states, d => Number.isFinite(inferMale(d))   ? inferMale(d)   : 0);
      const femaleAll = d3.sum(states, d => Number.isFinite(inferFemale(d)) ? inferFemale(d) : 0);
      chartData = [
        { city: 'Male',   male: maleAll,   female: 0,         total: maleAll   },
        { city: 'Female', male: 0,         female: femaleAll, total: femaleAll },
      ];
      subTitle = 'United States (all states)';
    }

    const w = OUTER_W - margin.left - margin.right;
    const h = OUTER_H - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales (raw file used linear, here we use band for categorical city axis)
    const x = d3.scaleBand()
      .domain(chartData.map(d => d.city)) // keeps the alphabetical order we set above
      .range([0, w])
      .padding(0.10);

    const yMax = d3.max(chartData, d => d.male + d.female) || 1;
    const y = d3.scaleLinear().domain([0, yMax * 1.12]).nice().range([h, 0]);

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    xAxis.selectAll('text')
      .style('font-family', FONT)
      .style('font-size', 14)
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-45) translate(-6,0)');

    const maxTicksByWidth = Math.max(6, Math.floor(w / 48));
    if (chartData.length > maxTicksByWidth) {
      const skip = Math.ceil(chartData.length / maxTicksByWidth);
      xAxis.selectAll('.tick').attr('display', (_, i) => (i % skip ? 'none' : null));
    }

    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(',')))
      .selectAll('text')
      .style('font-family', FONT)
      .style('font-size', 12);

    // change the title / disclaimer area (raw file did text at top-left & a disclaimer elsewhere)
    // here: centered title + subtitle above chart area
    svg.append('text')
      .attr('x', OUTER_W/2)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .style('font-family', FONT)
      .style('font-weight', 'bold')
      .style('font-size', 22)
      .text(titleText);

    svg.append('text')
      .attr('x', OUTER_W/2)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .style('font-family', FONT)
      .style('font-weight', 'bold')
      .style('font-size', 18)
      .style('fill', '#444')
      .text(subTitle);

    // Axis labels
    g.append('text')
      .attr('x', w/2)
      .attr('y', h + 86)
      .attr('text-anchor', 'middle')
      .style('font-family', FONT)
      .style('font-weight', 'bold')
      .style('font-size', 20)
      .text(chartData.length === 2 && chartData[0].city === 'Male' ? 'Gender' : 'Cities');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h/2)
      .attr('y', -56)
      .attr('text-anchor', 'middle')
      .style('font-family', FONT)
      .style('font-size', 20)
      .style('font-weight', 'bold')
      .text('Gun deaths (count)');

    // TODO: replace or edit the code below to change the city marker being used. Hint: think of the cityScale range (perhaps use area rather than radius).
    // (here: we render stacked rects instead of markers; consider area-normalized encodings if switching to dots)
    // draw the stacked bars (male/female)
    const stack = d3.stack().keys(['male','female']);
    const stacked = stack(chartData);

    const groups = g.selectAll('.series')
      .data(stacked)
      .enter().append('g')
      .attr('class', 'series');

    groups.selectAll('rect')
      .data(d => d.map(v => ({
        key: d.key,
        city: v.data.city,
        y0: v[0], y1: v[1],
        male: v.data.male,
        female: v.data.female
      })))
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('data-key', d => d.key)
      .attr('x', d => x(d.city))
      .attr('y', d => y(d.y1))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.max(0, y(d.y0) - y(d.y1)))
      .attr('rx', 4).attr('ry', 4)
      .attr('fill', d => d.key === 'male' ? COLORS.male : COLORS.female)
      .on('mouseover', function(e, d) {
        // TODO: Add code for a tooltip when you mouse over the city (raw file hint)
        // (implemented here: show single-gender value only)
        d3.select(this).attr('fill', d.key === 'male' ? COLORS.maleHover : COLORS.femaleHover);
        const isMale = d.key === 'male';
        const fmt = d3.format(',');
        tTip.html(`<b>${d.city} — ${isMale ? 'Male' : 'Female'}</b><br/>${isMale ? 'Male' : 'Female'}: ${fmt(isMale ? d.male : d.female)}`);
        props.ToolTip.moveTTipEvent(tTip, e);
      })
      .on('mousemove', (e) => props.ToolTip.moveTTipEvent(tTip, e))
      .on('mouseout', function(){
        d3.select(this).attr('fill', d3.select(this).attr('data-key') === 'male' ? COLORS.male : COLORS.female);
        props.ToolTip.hideTTip(tTip);
      });

    const totalsByCity = chartData.map(d => ({ city: d.city, total: d.male + d.female }));
    g.selectAll('.stackLabel')
      .data(totalsByCity)
      .enter().append('text')
      .attr('class', 'stackLabel')
      .attr('x', d => x(d.city) + x.bandwidth()/2)
      .attr('y', d => y(d.total) - 6)
      .attr('text-anchor', 'middle')
      .style('font-family', FONT)
      .style('font-size', 16)
      .style('fill', '#111')
      .text(d => d3.format(',')(d.total));

    const legend = g.append('g').attr('transform', `translate(${w - 170}, -20)`);
    const legendData = [
      { key:'male',   label:'Male',   color: COLORS.male,   hover: COLORS.maleHover },
      { key:'female', label:'Female', color: COLORS.female, hover: COLORS.femaleHover },
    ];

    const items = legend.selectAll('.legendItem')
      .data(legendData)
      .enter().append('g')
      .attr('class','legendItem')
      .attr('transform', (_,i)=>`translate(0, ${i*28})`)
      .style('cursor','pointer')
      .on('mouseenter', function(_, d){
        d3.select(this).select('rect').attr('fill', d.hover);
        g.selectAll(`rect.bar[data-key="${d.key}"]`).attr('fill', d.hover);
      })
      .on('mouseleave', function(_, d){
        d3.select(this).select('rect').attr('fill', d.color);
        g.selectAll(`rect.bar[data-key="${d.key}"]`).attr('fill', d.color);
      });

    items.append('rect')
      .attr('x', 0).attr('y', -12)
      .attr('width', 18).attr('height', 18)
      .attr('rx', 3).attr('ry', 3)
      .attr('fill', d => d.color);

    items.append('text')
      .attr('x', 26).attr('y', 0)
      .style('font-family', FONT)
      .style('font-size', 14)
      .text(d => d.label);

  }, [svg, widthFromHook, height, props.data, activeKey, props.brushedState, props.zoomedState]);

  // END of TODO #1. (raw file marker)

  // return wrapper for the chart; auto-resizes via useSVGCanvas
  return (
    <div
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        height: '440px',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="d3-component"
        ref={d3Container}
        style={{ width: '100%', height: '150%' }}
      />
    </div>
  );
}
