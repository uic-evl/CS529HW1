import React, { useRef, useMemo, useEffect, useState } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

export default function Whitehat(props){
  // this is a generic component for plotting a d3 plot
  const d3Container = useRef(null);

  // this automatically constructs an svg canvas the size of the parent container (height and width)
  // tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
  // this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);
  let isZoomed = false;

  // TODO: change the line below to change the size of the white-hat maximum bubble size
  // (albers usa projection puts alaska in the corner; we use projection to convert lat/lng to svg coordinates)
  const [metric, setMetric] = useState('rate');

  // NOTE: maxRadius sets the upper bound of city marker size (consider scaling by *area* for perceptual fairness)
  const maxRadius   = Math.max(2, width/120);

  // albers usa projection puts alaska in the corner
  // this automatically convert latitude and longitude to coordinates on the svg canvas
  const projection  = d3.geoAlbersUsa().translate([width/2, height/2]);

  // set up the path generator to draw the states
  const geoGenerator= d3.geoPath().projection(projection);

  // we need to use this function to convert state names into ids so we can select individual states by name using javascript selectors
  const cleanString = (s) => String(s ?? '').trim().replace(/\s+/g,'_');
  const cleanKey    = cleanString;

  // TODO: edit or replace this code to create your white-hat version of the map view; for example, change the color map based on colorbrewer2,
  const [popByState, setPopByState] = useState(null);
  useEffect(() => {
    const url = process.env.PUBLIC_URL + '/data/state_populations.csv';
    d3.text(url).then(text => {
      const rows  = d3.csvParseRows(text);
      const rowEq = lbl => rows.find(r => String(r?.[0] ?? '').trim().toLowerCase() === lbl);
      const abbrRow = rows[0];
      const nameRow = rowEq('state');
      const popRow  = rowEq('pop_2014');
      if (!abbrRow || !nameRow || !popRow) { setPopByState(new Map()); return; }
      const abbrs = abbrRow.slice(1).map(a => String(a ?? '').trim());
      const names = nameRow.slice(1).map(n => String(n ?? '').trim());
      const pops  = popRow.slice(1).map(p => +String(p ?? '').replace(/,/g,''));
      const pairs = [];
      for (let i=0;i<pops.length;i++){
        const pop = pops[i];
        if (!Number.isFinite(pop) || pop <= 0) continue;
        pairs.push([cleanKey(names[i]), pop]);
        pairs.push([cleanKey(abbrs[i]), pop]);
      }
      setPopByState(new Map(pairs));
    });
  }, []);

  // This is the main loop that renders the map after SVG + data are ready
  const mapGroupSelection = useMemo(() => {
    // wait until the svg is rendered and data is loaded
    if (!(svg && props.map && props.data && popByState)) return;
    svg.attr('width',  width).attr('height', height);

    const stateData = props.data.states;

    // EDIT THIS TO CHANGE WHAT IS USED TO ENCODE COLOR
    // (here we encode either total deaths or deaths per 100k depending on the toggle)
    const valueFor = d => {
      if (metric === 'total') return +d.count || 0;
      const pop = popByState.get(cleanString(d.state));
      if (!Number.isFinite(pop) || pop <= 0) return NaN;
      return (d.count / pop) * 100000;
    };

    // this section of code sets up the colormap
    // get color extents for the color legend
    const vals   = stateData.map(valueFor).filter(Number.isFinite);
    const vMax   = Math.max(1, d3.max(vals) ?? 1);

    // color map scale, scales numbers to a smaller range to use with a d3 color scale
    // TODO: EDIT HERE TO CHANGE THE COLOR SCHEME (e.g., ColorBrewer sequential)
    const scale  = d3.scaleLinear().domain([0, vMax]).range([0, 1]);
    const colorI = metric === 'total' ? d3.interpolateGreens : d3.interpolateBlues;

    // this set of functions extracts the features given the state name from the geojson
    const getValueByName = (name) => {
      const key = cleanString(name);
      const row = stateData.find(r => r.state === key);
      return row ? valueFor(row) : 0;
    };

    // clear earlier drawings
    svg.selectAll('g').remove();

    // OPTIONAL: EDIT THIS TO CHANGE THE DETAILS OF HOW THE MAP IS DRAWN
    // layered groups so circles always sit above states
    const mapGroup   = svg.append('g').attr('class','mapbox');
    const stateLayer = mapGroup.append('g').attr('class','stateLayer');
    const cityLayer  = mapGroup.append('g').attr('class','cityLayer');

    // --- helper: restore visuals based on whether a state is selected ---
    const restoreVisuals = () => {
      const selected = props.zoomedState ? cleanString(props.zoomedState) : null;

      stateLayer.selectAll('.state')
        .attr('opacity', selected ? 0.4 : 0.9)
        .each(function(){
          const node = d3.select(this);
          const orig = node.attr('data-fill');
          if (orig) node.attr('fill', orig);
        });

      if (selected) {
        const sel = stateLayer.select('#' + selected).attr('opacity', 1);
        if (metric === 'total') {
          sel.attr('fill', '#7C8B95');        // grey when TOTAL
        } else {
          sel.attr('fill', sel.attr('data-fill')); // keep blue when RATE
        }
        sel.raise();
      }
    };

    // draw borders from map and add tooltip
    stateLayer.selectAll('path').filter('.state')
      .data(props.map.features).enter()
      .append('path')
      .attr('class','state')
      // ID is useful if you want to do brushing as it gives you a way to select the path
      .attr('id', d => cleanString(d.properties.NAME))
      .attr('d',  geoGenerator)
      .attr('fill', d => colorI(scale(getValueByName(d.properties.NAME))))
      .attr('data-fill', d => colorI(scale(getValueByName(d.properties.NAME))))
      .attr('stroke', '#7f8c8d')
      .attr('stroke-width', .6)
      .attr('cursor','pointer')
      .on('mouseenter', (e, d) => {
        // OPTIONAL: EDIT HERE TO CHANGE THE BRUSHING BEHAVIOUR IN THE MAP WHEN MOUSING OVER A STATE
        const stateName = d.properties.NAME;
        const key       = cleanString(stateName);
        if (props.brushedState !== key) props.setBrushedState(key);

        stateLayer.selectAll('.state')
          .attr('opacity', 0.4)
          .each(function(){
            const node = d3.select(this);
            const orig = node.attr('data-fill');
            if (orig) node.attr('fill', orig);
          });

        const hovered = stateLayer.select('#' + key).attr('opacity', 1);
        if (metric === 'total') hovered.attr('fill', '#7C8B95');
        else hovered.attr('fill', hovered.attr('data-fill'));
        hovered.raise();

        // tooltip (see app.js for the helper that positions this)
        const entry  = stateData.find(x => x.state === key);
        const deaths = entry ? +entry.count : undefined;
        let html = `<b>${stateName}</b>`;
        if (metric === 'total') {
          if (deaths != null) html += `<br/>Gun deaths: ${d3.format(',')(deaths)}`;
        } else {
          const pop  = popByState.get(cleanKey(stateName));
          const rate = (Number.isFinite(pop) && deaths!=null) ? (deaths / pop) * 100000 : undefined;
          if (deaths != null)        html += `<br/>Gun deaths: ${d3.format(',')(deaths)}`;
          if (Number.isFinite(pop))  html += `<br/>Population: ${d3.format(',')(pop)}`;
          if (Number.isFinite(rate)) html += `<br/>Rate: ${d3.format('.1f')(rate)} per 100k`;
        }
        tTip.html(html);
      })
      .on('mousemove', (e) => props.ToolTip.moveTTipEvent(tTip, e))
      .on('mouseleave', () => {
        props.setBrushedState();
        props.ToolTip.hideTTip(tTip);
        restoreVisuals();
      });

    // TODO: replace or edit the code below to change the city marker being used. Hint: think of the cityScale range (perhaps use area rather than radius).
    // draw markers for each city
    cityLayer.selectAll('.city').remove();
    if (metric === 'rate') {
      const cityData = props.data.cities;
      const cityMax  = d3.max(cityData, d => d.count);

      // draw a linear (or sqrt) scale; consider using sqrt + area encoding for circles
      const rScale   = d3.scaleSqrt().domain([1, cityMax]).range([0, maxRadius]);

      // TODO: Add code for a tooltip when you mouse over the city (hint: use the same code for the state tooltip events .on... and modify what is used for the tTip.html)
      // OPTIONAL: change the color or opacity
      cityLayer.selectAll('.city')
        .data(cityData).enter()
        .append('circle')
        .attr('class','city')
        .attr('cx', d => projection([d.lng, d.lat])[0])
        .attr('cy', d => projection([d.lng, d.lat])[1])
        .attr('r',  d => rScale(d.count))
        .attr('fill', '#000')
        .attr('opacity', .35)
        .on('mouseenter', (e,d) => {
          tTip.html(`${d.city}, ${d.state}<br/>Gun deaths: ${d.count}`);
          props.ToolTip.moveTTipEvent(tTip, e);
        })
        .on('mousemove', (e) => props.ToolTip.moveTTipEvent(tTip, e))
        .on('mouseleave',  () => props.ToolTip.hideTTip(tTip));
    }

    // draw a color legend, automatically scaled based on data extents
    // (non-zoom layer)
    svg.selectAll('.legendLayer').remove();

    // layout for legend card
    const barW   = Math.max(16, Math.min(48, width * 0.030));
    const barH   = Math.max(18, Math.min(42, height * 0.065));
    const padR   = Math.min(24, width * 0.025);
    const padT   = Math.min(48, height * 0.07);
    const font   = Math.min(16, Math.max(12, barW * 0.45));

    // fixed steps & title (OPTIONAL: EDIT THE VALUES IN THE ARRAY TO CHANGE THE NUMBER OF ITEMS IN THE COLOR LEGEND)
    const step   = (metric === 'total') ? 200 : 2.5;
    const fmt    = (metric === 'total') ? d3.format(',d') : d3.format('.1f');
    const title  = (metric === 'total') ? 'Total deaths (state)' : 'Deaths per 100k';

    // build legend edges
    const nBins  = Math.max(1, Math.ceil((Math.max(1, d3.max(vals) ?? 1)) / step));
    const edges  = d3.range(0, (nBins + 1) * step + 1e-6, step);

    // compute position and render legend
    const legendX = width - padR - barW - 140;
    const legendY = padT + 70;

    const legend = svg.append('g')
      .attr('class', 'legendLayer')
      .style('pointer-events', 'none')
      .attr('transform', `translate(${legendX},${legendY})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', font * 1.25)
      .attr('font-weight', 700)
      .attr('font-family', '"Times New Roman", Times, serif')
      .text(title);

    const titleGap = font * 1.6;
    const y0 = titleGap;

    // color map (TODO: EDIT HERE TO CHANGE THE COLOR SCHEME)
    const palette = (metric === 'total') ? d3.interpolateGreens : d3.interpolateBlues;
    const data = d3.range(nBins).map(i => {
      const a = edges[i], b = edges[i + 1];
      const isLast = (i === nBins - 1);
      const center = Math.min((a + b) / 2, Math.max(1, d3.max(vals) ?? 1));
      const lastLabel = `${fmt(a)}<`;
      return {
        y: y0 + i * barH,
        color: palette(center / Math.max(1, d3.max(vals) ?? 1)),
        label: isLast ? lastLabel : `${fmt(a)}–${fmt(b)}`
      };
    });

    legend.selectAll('.legendRect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'legendRect')
      .attr('x', 0)
      .attr('y', d => d.y)
      .attr('width', barW)
      .attr('height', barH)
      .attr('fill', d => d.color);

    legend.selectAll('.legendText')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'legendText')
      .attr('x', barW + 10)
      .attr('y', d => d.y + barH / 2 + font / 3)
      .attr('font-size', font)
      .attr('font-family', '"Times New Roman", Times, serif')
      .text(d => d.label);

    // Low / High guides
    legend.append('text')
      .attr('x', 0)
      .attr('y', y0 - 8)
      .attr('font-size', font * 0.9)
      .attr('font-family', '"Times New Roman", Times, serif').attr('font-weight','bold')
      .attr('fill', '#555')
      .text('Low');

    legend.append('text')
      .attr('x', 0)
      .attr('y', data[data.length - 1].y + barH + font * 0.9)
      .attr('font-size', font * 0.9)
      .attr('font-family', '"Times New Roman", Times, serif').attr('font-weight','bold')
      .attr('fill', '#555')
      .text('High');

    // background card for legend
    const bb = legend.node().getBBox();
    legend.insert('rect', ':first-child')
      .attr('x', bb.x - 12)
      .attr('y', bb.y - 12)
      .attr('rx', 10).attr('ry', 10)
      .attr('width',  bb.width  + 24)
      .attr('height', bb.height + 24)
      .attr('fill', '#fff')
      .attr('opacity', 0.9)
      .attr('stroke', '#e5e7eb');

    // initial paint consistent with selection (if any)
    // (brush the state by altering its opacity when the property changes)
    // brushed state can be on the same level but that makes it harder to use in linked views
    // so its in the parent app to simplify the "whitehat" part which uses linked views.
    restoreVisuals();
    return mapGroup;
  }, [svg, props.map, props.data, popByState, width, height, metric, props.zoomedState]);

  // This adds zooming. Triggers whenever the function above finishes
  // this section can be included in the main body but is here as an example
  // of how to do multiple hooks so updates don't have to occur in every state
  useMemo(() => {
    if (!mapGroupSelection) return;
    const zoom = d3.zoom().extent([[0, 0], [width, height]]).on('zoom', (event) => {
      const { transform } = event;
      mapGroupSelection.attr('transform', transform).attr('stroke-width', 1/transform.k);
    });

    // OPTIONAL: EDIT THIS CODE TO CHANGE WHAT HAPPENS WHEN YOU CLICK A STATE
    // useful if you want to add brushing
    function clicked(event, d) {
      event.stopPropagation();
      if (isZoomed) {
        mapGroupSelection.transition().duration(300)
          .call(zoom.transform, d3.zoomIdentity.translate(0,0), d3.pointer(event, svg.node()));
      } else {
        // get bounds of path from map and zoom to bounds
        const [[x0, y0], [x1, y1]] = geoGenerator.bounds(d);
        mapGroupSelection.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(Math.min(8, 0.9 / Math.max((x1-x0)/width, (y1-y0)/height)))
            .translate(-(x0+x1)/2, -(y0+y1)/2),
          d3.pointer(event, svg.node())
        );
      }
      // sets the zoomed state property in the main app when we click on something
      // if we are zoomed in, unzoom instead
      isZoomed = !isZoomed;
      props.setZoomedState(isZoomed ? d.properties.NAME : undefined);
    }

    mapGroupSelection.selectAll('.state').attr('cursor','pointer').on('click', clicked);
    mapGroupSelection.call(zoom);
  }, [mapGroupSelection, svg, width, height]);

  // OPTIONAL: EDIT HERE TO CHANGE THE BRUSHING BEHAVIOUR IN THE MAP WHEN MOUSING OVER A STATE
  // WILL UPDATE WHEN THE "BRUSHEDSTATE" VARIABLE CHANGES
  // brush the state by altering it's opacity when the property changes
  // brushed state can be on the same level but that makes it harder to use in linked views
  // so its in the parent app to simplify the "whitehat" part which uses linked views.

  // small metric toggle UI
  const Toggle = () => (
    <div style={{
      position:'absolute', right:25, top:10,
      background:'rgba(255,255,255,0.9)', padding:6, borderRadius:8,
      boxShadow:'0 1px 4px rgba(0,0,0,.15)', display:'flex', gap:6,
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      <span style={{fontSize:18, fontWeight:'bold', marginRight:4}}>View by:</span>
      <button
        onClick={()=>setMetric('total')}
        style={{padding:'4px 8px', borderRadius:6, border:'1px solid #bbb',
                background: metric==='total' ? '#e9f7ef' : '#fff', cursor:'pointer',
                fontFamily: '"Times New Roman", Times, serif', fontWeight:'bold'}}
      >Total deaths</button>
      <button
        onClick={()=>setMetric('rate')}
        style={{padding:'4px 8px', borderRadius:6, border:'1px solid #bbb',
                background: metric==='rate' ? '#e8f0fe' : '#fff', cursor:'pointer',
                fontFamily: '"Times New Roman", Times, serif', fontWeight:'bold'}}
      >Per 100k</button>
    </div>
  );

  return (
    <div
      className="d3-component"
      style={{ height: '99%', width: '99%', position: 'relative' }}
      ref={d3Container}
    >
      {/* Page title — neutral wording; centered at the very top */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 8,
          transform: 'translateX(-50%)',
          fontFamily: '"Times New Roman", Times, serif',
          fontWeight: 'bold',
          fontSize: 22,
          color: '#111827',
          pointerEvents: 'none',
        }}
      >
      U.S. Gun Deaths per 100k by State (normalized by population)
      </div>

      <Toggle />

      {/* Keep description BELOW the map (unchanged) */}
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 8, // stays at the bottom
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 14,
          fontFamily: '"Times New Roman", Times, serif',
          color: '#111827',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,.08)'
        }}
      >
        {metric === 'total'
          ? 'Choropleth shows total deaths by state.'
          : 'Choropleth shows deaths per 100k by state.'}
      </div>
    </div>
  );
}
