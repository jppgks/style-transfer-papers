import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
const path = require('path');

window.tf = tf;
window.tfvis = tfvis;

window.model;

async function initModel() {
  const model_host = '127.0.0.1:8080';
  window.model = await tf.loadModel(`http://${model_host}/model.json`);
  //window.model.summary();
}

document.addEventListener('DOMContentLoaded', function() {
  initModel();
});

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
document.querySelector('#show-model').addEventListener('click', showModel);


