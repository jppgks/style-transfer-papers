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

async function showModel() {
  const surface = { name: 'Model Summary', tab: 'Model' };
  tfvis.show.modelSummary(surface, model);
}
document.querySelector('#show-model').addEventListener('click', showModel);

