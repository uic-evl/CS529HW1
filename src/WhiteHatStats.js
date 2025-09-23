import React, {useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

//change the code below to modify the bottom plot view
export default function WhiteHatStats(props){
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const margin = 50;
    const radius = 10;

    useEffect(()=>{
        //wait until the data loads
        if(svg === undefined || props.data === undefined){ return }
    
        //aggregate gun deaths by state
        const data = props.data.states;
    
        // build plotData with male and female counts
        const plotData = data.map(state => ({
            name: state.state,
            male: state.male_count,
            female: state.count - state.male_count,
            total: state.count
        }));

        // if (props.brushedState) {
        //     plotData = plotData.filter(d => d.name === props.brushedState);
        // }
   
        //get transforms for each value into x and y coordinates        
        let xScale = d3.scaleBand()
            .domain(plotData.map(d => d.name))
            .range([margin, width-margin])
            .padding(0.2);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.total)])
            .range([height-margin, margin]);
    
        // colors for male vs female
        const colorScale = d3.scaleOrdinal()
            .domain(["male", "female"])
            .range(["steelblue", "pink"]);
    
        // stacking the male & female gun deaths data
        const stackGen = d3.stack()
            .keys(["male", "female"]);
        const stackedData = stackGen(plotData);
    
        // clear old elements
        svg.selectAll("*").remove();
    
        // draw stacked bars
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
                .attr("fill", d => colorScale(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
                .attr("x", d => xScale(d.data.name))
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("width", xScale.bandwidth())
                .on("mouseover",(e,d)=>{
                    let string = d.data.name + '</br>'
                        + 'Total Deaths: ' + d.data.total + '</br>'
                        + 'Male: ' + d.data.male + '</br>'
                        + 'Female: ' + d.data.female;
                    props.ToolTip.moveTTipEvent(tTip,e);
                    tTip.html(string);
                })
                .on("mousemove",(e)=>{
                    props.ToolTip.moveTTipEvent(tTip,e);
                })
                .on("mouseout",()=>{
                    props.ToolTip.hideTTip(tTip);
                });
    
                
        // draw axes
        svg.append("g")
            .attr("transform",`translate(0,${height - margin})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
            .selectAll("text")
                .attr("transform", "rotate(-90)")
                .style("text-anchor","end")
                .attr("dx", "-0.5em")
                .attr("dy", "-0.5em");
    
        svg.append("g")
            .attr("transform",`translate(${margin},0)`)
            .call(d3.axisLeft(yScale));
    
        // title
        const labelSize = margin/2;
        svg.append('text')
            .attr('x',width/2)
            .attr('y',labelSize)
            .attr('text-anchor','middle')
            .attr('font-size',labelSize)
            .attr('font-weight','bold')
            .text('Gun Deaths by Gender Across States');
    
        // legend
        const legend = svg.append("g")
            .attr("transform",`translate(${width - (2*margin)},${margin})`);
    
        ["Male","Female"].forEach((key,i)=>{
            let g = legend.append("g").attr("transform",`translate(0,${i*20})`);
            g.append("rect")
                .attr("width",12)
                .attr("height",12)
                .attr("fill", colorScale(key.toLowerCase()));
            g.append("text")
                .attr("x",18)
                .attr("y",10)
                .text(key);
        });
    
    },[props.data,svg])

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}
//END of TODO #1.

 
const drawingDifficulty = {
    'IL': 9,
    'AL': 2,
    'AK': 1,
    'AR': 3,
    'CA': 9.51,
    'CO': 0,
    'DE': 3.1,
    'DC': 1.3,
    'FL': 8.9,
    'GA': 3.9,
    'HI': 4.5,
    'ID': 4,
    'IN': 4.3,
    'IA': 4.1,
    'KS': 1.6,
    'KY': 7,
    'LA': 6.5,
    'MN': 2.1,
    'MO': 5.5,
    'ME': 7.44,
    'MD': 10,
    'MA': 6.8,
    'MI': 9.7,
    'MN': 5.1,
    'MS': 3.8,
    'MT': 1.4,
    'NE': 1.9,
    'NV': .5,
    'NH': 3.7,
    'NJ': 9.1,
    'NM': .2,
    'NY': 8.7,
    'NC': 8.5,
    'ND': 2.3,
    'OH': 5.8,
    'OK': 6.05,
    'OR': 4.7,
    'PA': 4.01,
    'RI': 8.4,
    'SC': 7.1,
    'SD': .9,
    'TN': 3.333333,
    'TX': 8.1,
    'UT': 2.8,
    'VT': 2.6,
    'VA': 8.2,
    'WA': 9.2,
    'WV': 7.9,
    'WY': 0,
}
