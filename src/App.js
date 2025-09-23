import React, {useState,useEffect} from 'react';
import './App.css';
import Whitehat from './Whitehat';
import WhiteHatStats from './WhiteHatStats';
import Blackhat from './Blackhat';
import BlackHatStats from './BlackHatStats';

function App() {
  const [viewToggle, setViewToggle] = useState('blackhat');

  const [map, setMap] = useState();
  const [gunData, setGunData] = useState();

  const [zoomedState,setZoomedState] = useState();
  const [selectedStuff,setSelectedStuff] = useState();
  const [brushedState,setBrushedState] = useState();

  async function fetchMap(){
    fetch('us-states.geojson').then(paths=>{
      paths.json().then(data=> setMap(data))
    })
  }
  async function fetchGunData(){
    fetch('processed_gundeaths_data.json').then(d => {
      d.json().then(gd=> setGunData(gd))
    })
  }

  useEffect(()=>{
    fetchMap();
    fetchGunData();
  },[]);

  const tabBtn = (active) => ({
    padding: '6px 14px',
    borderRadius: 9999,
    border: '1px solid #d1d5db',
    background: active ? '#e5e7eb' : '#ffffff',
    color: '#111827',
    fontWeight: 600,
    fontFamily: '"Times New Roman", Times, serif',
    cursor: 'pointer',
    margin: '0 6px',
    boxShadow: active ? 'inset 0 0 0 1px #d1d5db' : 'none'
  });

  const Instructions = () => (
    <div
      className="shadow"
      style={{
        position: 'absolute',
        right: '1.55rem',
        top: '440px',
        width: '16rem',
        maxWidth: '40vw',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(2px)',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '0.8rem 1rem',
        zIndex: 10,
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      <h2 style={{margin: 0, fontSize: 22, fontFamily: '"Times New Roman", Times, serif'}}>Instructions</h2>
      <p style={{margin: '0.35rem 0 0 0', fontSize: 16, lineHeight: 1.3}}>
        Click a state to zoom. Click again to reset. Hover states/cities for details.
      </p>
    </div>
  );

  const SourcesCard = () => (
    <div
      className="shadow"
      style={{
        position: 'fixed',
        right: '0.15rem',
        bottom: '1.5rem',
        width: '18rem',
        maxWidth: '42vw',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(2px)',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '0.8rem 1rem',
        zIndex: 9, // just under the tooltip/map UI if they overlap
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      <h2 style={{margin: 0, fontSize: 20}}>Sources</h2>
      <div style={{marginTop: 6, fontSize: 16, lineHeight: 1.35, color: '#374151'}}>
        <div>
          <a href="https://github.com/slate" target="_blank" rel="noopener noreferrer">
            Slate gun-death dataset
          </a>
        </div>
        <div>
          <a href="https://www.census.gov/" target="_blank" rel="noopener noreferrer">
            U.S. Census state population
          </a>
        </div>
      </div>
    </div>
  );

  function makeWhiteHat(){
    return (
      <>

        <div style={{width:'100%', height:'50%', position:'relative'}}>
          <div style={{height:'100%', width:'100%'}}>
            <Whitehat
              map={map}
              data={gunData}
              ToolTip={ToolTip}
              zoomedState={zoomedState}
              setSelectedStuff={setSelectedStuff}
              setZoomedState={setZoomedState}
              brushedState={brushedState}
              setBrushedState={setBrushedState}
            />
          </div>
          <Instructions />
        </div>

        {/* STATS (bottom half) */}
        <div style={{height:'49%', width:'99%'}}>
          <div
            style={{
              height:'100%',
              width:'50%',
              maxWidth:'60em',
              margin:'0 auto'
            }}
          >
            <WhiteHatStats
              data={gunData}
              ToolTip={ToolTip}
              brushedState={brushedState}
              setBrushedState={setBrushedState}
              zoomedState={zoomedState}
            />
          </div>
        </div>
      </>
    )
  }

  function makeBlackHat(){
    return (
      <>
        {/* MAP (top half) */}
        <div style={{width:'100%', height:'50%', position:'relative'}}>
          <div style={{height:'100%', width:'100%'}}>
            <Blackhat
              map={map}
              data={gunData}
              ToolTip={ToolTip}
              zoomedState={zoomedState}
              setSelectedStuff={setSelectedStuff}
              setZoomedState={setZoomedState}
              brushedState={brushedState}
              setBrushedState={setBrushedState}
            />
          </div>
          <Instructions />
        </div>

        {/* STATS (bottom half) */}
        <div style={{height:'49%', width:'100%'}}>
          <div
            style={{
              height:'100%',
              width:'50%',
              maxWidth:'60em',
              margin:'0 auto'
            }}
          >
            <BlackHatStats data={gunData} ToolTip={ToolTip} />
          </div>
        </div>
      </>
    )
  }

  const hat = () => (viewToggle === 'whitehat' ? makeWhiteHat() : makeBlackHat());

  return (
    <div
      className="App"
      style={{
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      <div className="header"
           style={{
             height:'3.2rem',
             width:'100vw',
             display:'flex',
             alignItems:'center',
             justifyContent:'center',
             gap:'4px',
             fontFamily: '"Times New Roman", Times, serif'
           }}
      >
        <button
          onClick={() => setViewToggle('whitehat')}
          style={tabBtn(viewToggle === 'whitehat')}
          aria-pressed={viewToggle === 'whitehat'}
        >
          White Hat
        </button>
        <button
          onClick={() => setViewToggle('blackhat')}
          style={tabBtn(viewToggle === 'blackhat')}
          aria-pressed={viewToggle === 'blackhat'}
        >
          Black Hat
        </button>
      </div>

      <div className="body" style={{height:'calc(100vh - 3.2rem)', width:'100vw'}}>
        {hat()}
      </div>

      {/* Fixed bottom-right sources */}
      <SourcesCard />
    </div>
  );
}

class ToolTip {
  static moveTTip(tTip, tipX, tipY){
    var tipBBox = tTip.node().getBoundingClientRect();
    while(tipBBox.width + tipX > window.innerWidth){ tipX = tipX - 10; }
    while(tipBBox.height + tipY > window.innerHeight){ tipY = tipY - 10; }
    tTip.style('left', tipX + 'px')
        .style('top',  tipY + 'px')
        .style('visibility', 'visible')
        .style('z-index', 1000)
        .style('font-family', '"Times New Roman", Times, serif');
  }
  static moveTTipEvent(tTip, event){
    var tipX = event.pageX + 30;
    var tipY = event.pageY - 20;
    this.moveTTip(tTip, tipX, tipY);
  }
  static hideTTip(tTip){ tTip.style('visibility', 'hidden'); }
  static addTTipCanvas(tTip, className, width, height){
    tTip.selectAll('svg').selectAll('.'+className).remove();
    let canvas = tTip.append('svg').attr('class',className)
      .attr('height',height).attr('width',width)
      .style('background','white');
    return canvas;
  }
}

export default App;
