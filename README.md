## Instructions

### Installing Node and npm

There are several ways to install node.js which is required to run react.

The easiest way is to simply install node from the website:

https://nodejs.org/en/download

During the node installation, npm will be fetched as well. 

Verify the installations using node -v and npm -v in the terminal. If any of the verification steps gives you a command not found error, you most likely don't have the binary path to the library on your PATH variable (check Environmental Variables on windows). Related to this point, tools like NodeJS or git also provide their own shell (terminal) but you can use everything from your normal terminal; just make sure that your PATH is configured correctly.

For the next steps, please consult the homework handout.

##### If you are using ubuntu, try also Node Version Manager
We recommend using Node Version Manager (NVM), if you are using ubuntu:

https://github.com/nvm-sh/nvm

 In the command line, use NVM to install Node. We built this demo using node v14.15.4, but any version that support create-react-app should work:

 > nvm install 14.15.4


### Fork the Hw01 support code repository or download the .zip

If you are familiar with Github, then fork this repository and proceed to your copy of the subfolders in the repository. Otherwise, just download the zip with all the files.

For this assignment, you will only need to work (i.e., edit) the following files: 
src/App.js, src/Blackhat.js, src/Blackhatstats.js, src/Whitehat.js and src/Whitehatstats.js.

In your unzipped folder, run
> npm install

then test the result of the support code like this:

> npm start

If all goes well, it will automatically open a browser view to localhost:3000 (or similar) and show you the result of the support code.


### If you just pull from Gitub (instead of downloading the zip as above): Pulling the project from Github

clone the github repo :

> git clone https://github.com/tehwentzel/CS529HW2.git

Install the required npm packages:
> cd CS529HW2

> npm install

Test the program

>npm start

The code should launch a window in your browser showing a data visualization


### Editing the Files

To make your later development easier, and to help wih your final project, the Hw01 code is embedded as a React app. You don't need to worry about React at this point. If you're curious, React is a free, open-source javascript UI (User Interface) library developed by Facebook/Meta. If for later assignments or for your final project you'd like to change the structure of the webpage being shown (more than two views, or differently sized views etc.), then you'd work with React and JSX, which stands for JavaScript XML. JSX makes it easier to write and add HTML in React.

In the src folder, you shoud see the following files:

* App.js is our top-level app which imports the other apps. This file includes the state variables for the interface, the code for loading in the data, and the JSX for laying out the data based on the filters selected. Any changes to the layout or data would go in this file.

* App.css contains the css for the code. For this example code, most of the formatting is done directly in jsx. Some of the formatting is also done in css, and this is the location of that formatting code. css is an alernative to make the code cleaner.

* Blackhat.js is code for the Map when the "viewToggle" variable is set to 'blackhat'.

* BlackhatStats.js is the code for the dummy chart below the map when the "viewToggle" variable is set to 'blackhat'. Edit this to change it so something useful.

* Whitehat.js is code for the Map when the "viewToggle" variable is set to 'whitehat'.

* WhitehatStats.js is the code for the histogram when the "viewToggle" variable is set to 'whitehat'.

* D3Component.js is a template code for making a new D3 visualization. You don't need to worry about this file at this point, although it will be useful for your final project.

* useSVGCanvas.js is a helper hook used in the d3 components that makes an svg that is sized to the parent container, gets a tooltip div (or makes one), and returns the constants "svg, height, width, tTip" for use in the component. This hook updates when the window resizes so your d3 visualizations will update if you use responsive layouts. You don't need to worry about this file.

In the public folder, where the code looks for files by default:

* us-states.geojson is the file with the map of the states in the geojson standard which is used by the application
* processed_gundeaths_data.json is the processed gun data used in the application

You don't need to worry about these files at this point, but it will be useful to understand what the data is structured like inside these files when you start creating your own white hat solution.

In the python folder:

* Preprocessing.ipynb is a jupyter notebook with the code used to process the example data
* SlateGunDeaths.csv is the original data
* state_populations.csv is a file with state populations from 2014
* states-10m.json is a file with the us states similar to us-statse.geojson

You don't need to worry about these files.

From this point on, please use the homework handout to figure out what you need to do.

### For Extra-Credit

#### Creating a new D3 Visualization

Our example code has a file called D3Compnent.js, which serves as a template for one method of writing D3 code with react.

To create a new D3 component, first rename the file to something fitting. We will use <PlotD3> as an example

* Copy the file and rename it to "PlotD3.js"
* Change the class name in the file from

> export default function D3Component(props){

to 
> export default function PlotD3(props){


Then put the d3 code in the relevant section of the file.
Put any code that doesn't require the data to be loaded here in place of the console.log call:

~~~text
useEffect(()=>{
        if(svg !== undefined){
            console.log('here',height,width)
        }
    },[svg])
~~~

This code will run once any time the window updates

Put any code that needs to be updated once the data is loaded here:

~~~text
useEffect(()=>{
        if(svg !== undefined & props.data !== undefined){
            //put code here
            console.log('here',props.data,height,width);
        }
    },[svg,props.data]);
~~~

This second loop will update when the window resizes or the variable passes in the properties as "data" changes.

To put this visualization into the main app, go to App.js. At the top of the file, import the component:

import PlotD3 from './PlotD3.js';

The component automaticaly sizes itself to the parent container in App.js. Thus, put the component in the return of App.js wrapped in a div of the desired dimensions, and pass the data to be used as an property. 

The code below will return the plot as a 50x50 pixel window once the variable "gunData" loads

~~~text
return ( 
    <div style={{'height': '50px','width':'50px'}}>
        <PlotD3.js 
            data= {gunData} 
        />
    <div> 
) 
~~~

#### Preprocessing data to generate new information

We provide an example of processed code in the form of processed_gundeaths_data.json, as well as the original code SlateGunDeath.csv and slate_populations.csv

The preprocessing used to create our example data can be found in python/Preprocessing.ipynb as a jupyter notbook. For EC, you could preprocess the data to generate new information, for example to add per-state voting information or information about the leniency of per-state gun legislatures.

#### Loading New Data

New data is loaded into the project using asyncronous hooks. To accomplish this, first, write a new function for calling the preprocessed data. First, we recommend putting the data as part of the App state using react's 'useState':

~~~text
function App() {
  const [data,setData] = useState();
~~~

This makes a variable called "data" that is initially undefined. This is why the D3Component code includes a catch that checks that the data isn't undefined

~~~text
useEffect(()=>{
        if(svg !== undefined & props.data !== undefined){
            //put code here
            console.log('here',props.data,height,width);
        }
    },[svg,props.data]);
~~~

The variable can be changed using

> setData(newdata)

The data needs to be loaded asyncronously. If the data is in a json form, use something like

~~~text
async function fetchData(){
    fetch('data.json').then(paths=>{
        paths.json().then(newData=>{
            //do any processing of the data here
            setData(newData)
        })
    })
}
~~~

for CSV files, we need to use a slightly different code. d3 proves CSV processing

~~~text 
import * as d3 from 'd3';

...

async function fetchCSV(){
    d3.csv('data.csv').then(d=>{
        setData(d);
    })
}
~~~

The calls for "then()" are because fetch and d3.csv return promises. You can read more about those here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

The easiest way to load the data in the app is then to wrap all your data loading functions in a hook like this:

~~~text
//fetch data, called only once
  useEffect(()=>{
    fetchData();
    fetchCSV(); 
  },[])
~~~

The '[]' argument passed to useEffect lists the props to listen to for an update to the hook. By passing an empty array we only call the function once at the start of the rendering. If we wanted to reload the data after a variable change that is used in the data query, we would change it to:

~~~text
useEffect(()=>{
    fetchDataWithParameters(param);
},[param]);
~~~

#### Additional Tooltips via other libraries

Our example code uses a ToolTip class (see below). There are several other ways to achieve tooltips in javascript. Some premade options are
 
 * tipsy: https://github.com/CreativeDream/jquery.tipsy
 * react tooltip: https://react-tooltip.com/docs/getting-started
 * Material UI library: https://mui.com/material-ui/react-tooltip/

Because react and d3 use different paradigms, we provide some premade code intended to make tooltip calls easier that don't use non-react libraries. We simple include the code for a tooltip class: 

~~~text
class ToolTip {
  static moveTTip(tTip, tipX, tipY){
    var tipBBox = tTip.node().getBoundingClientRect();
    while(tipBBox.width + tipX > window.innerWidth){
        tipX = tipX - 10 ;
    }
    while(tipBBox.height + tipY > window.innerHeight){
        tipY = tipY - 10 ;
    }
    tTip.style('left', tipX + 'px')
        .style('top', tipY + 'px')
        .style('visibility', 'visible')
        .style('z-index', 1000);
  }

  static moveTTipEvent(tTip, event){
      var tipX = event.pageX + 30;
      var tipY = event.pageY -20;
      this.moveTTip(tTip,tipX,tipY);
  }


  static hideTTip(tTip){
      tTip.style('visibility', 'hidden')
  }

  static addTTipCanvas(tTip, className, width, height){
      tTip.selectAll('svg').selectAll('.'+className).remove();
      let canvas = tTip.append('svg').attr('class',className)
          .attr('height',height).attr('width',width)
          .style('background','white');
      return canvas
  }
}
~~~

This includes premade calls designed to go inside javascript event calls. We also need a div selection with certain css properties to make the position work. add this code into App.css.

~~~text
.tooltip {	
  position: absolute;
  z-index: 10;
  opacity: 1!important;			
  text-align: center;			
  width: auto;		
  max-width: 50vw;			
  height: auto;					
  padding: 10px;				
  font: 12px sans-serif;		
  background: rgb(172, 173, 173);	
  border: 0px;		
  border-radius: 8px;			
  pointer-events: none;	
  font-size: .7em!important;		
}
~~~

This styling can be altered, but the important part is "position: absolute".

Our example code for a D3 component already gives you the selection for a div with the tooltip class with the name "tTip".

For example, if we have code to draw a series of circles, we can add a tooltip call as such:

~~~text
le tTip = d3.select('.tooltip')//we need a selection for the tooltip item 
svg.selectAll('circle')
    .data(props.data).enter()
    .append('circle')
    .attr('cx',getX)
    .attr('cy',getY)
    .attr('r',getRadius)
    .on('mouseover',(e,d)=>{
        //e is the "event" for javascript
        //d is the data item associated with props.data

        //get the text to put in to the tooltip
        let string = getToolTipText(d);
        tTip.html(string);
        //move 
        ToolTip.moveTTipEvent(tTip,e);
    }).on('mousemove',(e)=>{
        //moves the tooltip relative to your mouse
        ToolTip.moveTTipEvent(tTip,e);
    }).on('mouseout',(e,d)=>{
        //hide the tooltip once the mouse stops hovering over the circle
        ToolTip.hideTTip(tTip);
    });
~~~

This can be altered if you want different tooltip behaviour, such as moving the tooltip to a fixed location rather than relative to the mouse using ToolTip.moveTTip.

Also, our example code passes the ToolTip class as a prop, so in the D3Component example code, you would use 

> props.ToolTip.moveTTip...

etc

#### Experimenting with Brushing and Linking in D3 and react

This is a guide for anyone that wants to experiment with linking interactions between multiple variables.
These guidelines are similar to how we deal with interactivity and state changes in general in react. Thus, we can do similar behaviour to do things like adding filters elsewhere in the app: https://react.dev/learn/reacting-to-input-with-state

By default, the easiest way to deal with d3 is to just remove everything and then redraw it whenever we update the data, which will likely work for all our data

~~~text
useEffect(()=>{
        if(svg !== undefined & props.data !== undefined){
            svg.selectAll().remove()
            svg.selectAll('circle').data(props.data)
                .enter().append('circle')
                ...
        }
    },[svg,props.data]);
~~~

However, if we want to only select certain features to update according to the  state of the app (such as with brushing), there are a few steps we need to do.

First, we want a state feature to track what is being tracked in App.js to link across different views:

~~~text
const [brushState,setBrushState] = useState();
~~~

In the example code brushedState is refering to the actual name of the US State, as well as the "state" of the brushing and linking.

We then pass these features into the children components as update the "brushedState" when someone mouses over an encoding for a state in one of the components

in App.js:

~~~text
return ( 
    ...
    <Whitehat
        ...
        brushedState={brushedState}
        setBrushedState={setBrushedState}
        ...
    />
    ...
)
~~~

Inside Whitehat/Blackhat
~~~text
let mapGroup = svg.append('g').attr('class','mapbox');
mapGroup.selectAll('path').filter('.state')
    .data(props.map.features).enter()
    .append('path').attr('class','state')
    //etc...
    .on('mouseover',(e,d)=>{
        let state = cleanString(d.properties.NAME);
        //this updates the brushed state
        if(props.brushedState !== state){
            props.setBrushedState(state);
        }
        //tooltip code...
    }).on('mouseout',(e,d)=>{
        //set props.brushedState to undefined when we stop mousing over something
        props.setBrushedState();
        //tooltip code...
    });
~~~

We then add in hooks into Whitehat/Blackhat (useEffect or useMemo both work) and pass props.brushedState so it updates when we call props.setBrushedState. In the example code, the key is that brushedState is the same format as the ID attribute we attached to each path, so we can select it using d3/jquery style selectors:

~~~text
useMemo(()=>{
    //mapgroupselection is the d3 selector for all the paths in the map
    //which are given an id based on the state name

    //check that the map is already drawn
    if(mapGroupSelection !== undefined){
        //check if we are currently brushing over something
        const isBrushed = props.brushedState !== undefined;
        //lower opacity if there is something brushed
        mapGroupSelection.selectAll('.state')
            .attr('opacity',isBrushed? .4:.8)
            .attr('strokeWidth',isBrushed? 1:2);
        //make the brushed path higher opacity
        if(isBrushed){
            mapGroupSelection.select('#'+props.brushedState)
                .attr('opacity',1)
                .attr('strokeWidth',3);
        }
    }
},[mapGroupSelection,props.brushedState]);
~~~

In order to add "linking" between views, we simply do something similar in the Black/WhitehatStats views. By default, the example code passes the "brushedState" value to the linked WhiteHatStats view, but doesn't do anything with it. We have to options:

* Make a seperate hook that updates certain features, as we do in the map visualization
* Pass props.brushedState to the main view, and re-draw the graph depending on the linked view

To do the latter, we  need to pass the state to the main loop:

~~~text
useEffect(()=>{
        //wait until the data loads
        if(svg === undefined | props.data === undefined){ return }

        //aggregate gun deaths by state
        const data = props.data.states;
        const brushedState = props.brushedState 

        svg.selectAll().remove()
        //code here that draws the conditional graph
    },[props.data,svg,props.brushedState]);
~~~

#### Adding Custom Glyphs in Place of premade shapes

There are certains cases where you might want to make a custom shape in d3. The way to do this is to use SVG paths. First, we need to define a function to draw a shape we want using path syntax: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

For example, we can draw a diamond by defining the points around the (0,0) origin follows:

~~~text
function drawDiamond(dummyData){
    return 'M 0,1 -1,0 0,-1 1,0 z'
}
~~~

This is useful since we can extend the function to draw different things based on the data

we then pass this function to a d3 path call like we would with any other d3 shape. Instead of using size and position attributes, we use transforms. For example, if we define functions getScale, getX and getY to calculate the size and position of the datapoint, we can write:

~~~text
svg.selectAll('path').filter('.exampleDiamond')
    .data(props.data).enter()
    .append('path').attr('class','exampleDiamond')
    .attr('d',drawDiamond)
    .attr('transform',d=> 'scale(' + getScale(d) + ')' + 'translate(' + getX(d) + ',' + getY(d) + ')')
~~~

For example, if we wanted to draw city glyphs in a way that uses different colors to represent the portion of victims that are either male or female, we can change the code to draw two arcs of different sizes for each sub-population:

~~~text
function drawGlyph(d,male=true){
    let ratio = (d.male_count/d.count);
    let y = (1 - 2*ratio);
    y = Math.sign(y)*(y**2);
    let theta = Math.asin(y);
    let x = Math.cos(theta);
    if(male){
        let arc = 'M ' + x + ',' + y + ' '
            + 'A 1 1 0 1 1 ' + (-x) + y + 'z'
        return arc
    }
    else{
        let arc = 'M ' + x + ',' + y + ' '
            + 'A 1 1 0 0 0 ' + (-x) + y + 'z'
        return arc
    }
};

//draw the glyphs for the population
//one for male and female populations so we can use different colors
let b = mapGroup.selectAll('.bubbles').data(cityData);
function makeArc(male){
    const className = male? 'maleArcs': 'femaleArcs';
    b.enter()
    .append('path')
    .attr('d',d=>drawGlyph(d,male))
    .attr('class','bubbles '+className)
    .attr('id',d=>d.key)
    .attr('transform',getCityTransform)
    .attr('stroke-width',d=>.01/cityScale(d.male_count/d.count))
    .attr('stroke','black')
    .attr('fill',male?'navy':'magenta');
}

//male bubbles
makeArc(true);
//female bubbles
makeArc(false);
~~~