import React from "react";
import ReactDOM from "react-dom";

import './css/tfjs-examples.css';
import './css/index.css';

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
const path = require('path');

window.tf = tf;
window.tfvis = tfvis;

window.model;

async function initModel() {
  // Replace with host serving VGG model over HTTP, then remove model/ from project dir
  const model_host = '127.0.0.1:8080'; // 'raw.githubusercontent.com/jppgks/vgg19-tensorflowjs-model/master/model';
  window.model = await tf.loadModel(`http://${model_host}/model.json`);
  //window.model.summary();
}

function formatShape(shape) {
  const oShape = shape.slice();
  if (oShape.length === 0) {
    return 'Scalar';
  }
  if (oShape[0] === null) {
    oShape[0] = 'batch';
  }
  return `[${oShape.join(',')}]`;
}

/*
 * Gets summary information/metadata about a layer.
 */
function getLayerSummary(layer) {
  let outputShape;
  if (Array.isArray(layer.outputShape[0])) {
    const shapes = (layer.outputShape).map(s => formatShape(s));
    outputShape = `[${shapes.join(', ')}]`;
  } else {
    outputShape = formatShape(layer.outputShape);
  }

  return {
    name: layer.name,
    trainable: layer.trainable,
    parameters: layer.countParams(),
    outputShape,
  };
}

async function showModel() {
  const summary = {
    layers: model.layers.map(getLayerSummary),
  };

  const headers = [
    'Layer Name',
    'Output Shape',
    '# Of Params',
    'Trainable',
  ];

  const values = summary.layers.map(
      l =>
          [l.name,
           l.outputShape,
           l.parameters,
           l.trainable,
  ]);
  const summaryContainer = document.getElementById('summary-canvas');
  tfvis.render.table({headers, values}, summaryContainer);
}

class RootComp extends React.Component {
  constructor(props) {
    super(props);
    initModel();
  }

  componentDidMount() {
    document.querySelector('#show-model').addEventListener('click', showModel);
  }

  render() {
      return (<div>
			 <div className="tfjs-example-container">
				 <section className='title-area'>
				   <h1>TensorFlow.js: Style Transfer</h1>
				   <p className='subtitle'>TK subtitle
				   </p>
				 </section>
				 
				 <section>
				   <p className='section-head'>Description</p>
				   <p>
					 TK
				   </p>
				 </section>
				 
				 <section>
				   <p className='section-head'>Training Parameters</p>
				   
				   <button id="show-model">Describe Model</button>
				 </section>
				 
				 <section>
				   <p className='section-head'>Model Details</p>
				   <div id="stats">
					 <div className="canvases">
					   <label id="summary-label"></label>
					   <div id="summary-canvas"></div>
					 </div>
				   </div>
				 </section>
			</div>
        </div>)
  }
}

let App = document.getElementById("app");

ReactDOM.render(<RootComp />, App);

