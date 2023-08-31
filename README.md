## Instructions

#### Installing Node

There are several way to install node.js which is required to run react. We recommend using Node Version Manager (NVM), which includes installation for several different machines:

https://github.com/nvm-sh/nvm

 In the command line, use NVM to install Node. We built this demo using node v14.15.4, but any version that support create-react-app should work:

 > nvm install 14.15.4

 #### Creating a new react app from scratch

 Several other methods of starting apps are available at the react website for different frameworks: https://react.dev/learn/start-a-new-react-project. We will use create-react-app as it is the simplest and we assume you have node.

 in the command line, install a directory with create-react-app "project name"

 > create-react-app hw2

 In the the new app folder, use npm to install d3 for react:

> cd hw2

> npm install d3

for homework 3, also install three.js for react

> npm install three

From the src folder, copy App.js, App.css, BlackHat.js, WhiteHat.js, BlackHatStats.js, and WhiteHatStats.js into the /src/ folder. Overwrite the existing app.js and app.css

Move the data files processed_gun_deaths.json (for the data to visualize) and us-states.geojson (for the map of the US) into the /public folder. This is the default location the code looks when loading files. Other maps can be downloaded at: https://github.com/topojson/us-atlas

Test the program

> npm start

#### Downloading the project from Github

clone the github repo :

> git clone https://github.com/tehwentzel/CS529HW2.git

Install the required npm packages:
> cd CS529HW2

> npm install

Test the program

>npm start

The code should launch a window in your browser showing a data visualization

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

### Preprocessing data

We provide an example of processed code in the form of processed_gundeaths_data.json, as well as the original code SlateGunDeath.csv and slate_populations.csv

If you want to preprocess data in the future, we use python with the pandas library for data processing and jupyter notebooks for running the code.

Python 3 is on most machines. Instructions for downloading can be found here:
https://wiki.python.org/moin/BeginnersGuide/Download

Pandas is a data processing library. The easiest method is through installing anaconda


Pandas standalone can be install using the command

> pip install pandas

if you have machine specific issues, see this page:

https://pandas.pydata.org/docs/getting_started/install.html

Jupyter notebooks can be installed by running

> pip install jupyterlab

Which installs jupyterlab. Classic Jupyter notebook, which is somewhat more lightweight, can be installed with:

> pip install notebook

The preprocessing used to create our example data can be found in python/Preprocessing.ipynb as a jupyter notbook.

