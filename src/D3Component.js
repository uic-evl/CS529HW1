import React, {useEffect, useRef} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

export default function D3Component(props){
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    //you can use a hook like this to set up axes or things that don't require waiting for the data to load so it only draws once
    useEffect(()=>{
        if(svg !== undefined){
            console.log('here',height,width)
        }
    },[svg])

    //plot stuff here once the data loads
    useEffect(()=>{
        if(svg !== undefined & props.data !== undefined){
            //put code here
            console.log('here',props.data,height,width);
        }
    },[svg,props.data]);
    //the stuff in brackets what we listen for chagnes too. If you want to re-draw on other property changes add them here
    
    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}