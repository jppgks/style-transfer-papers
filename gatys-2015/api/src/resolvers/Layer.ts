import '@tensorflow/tfjs-node';
import * as tf from '@tensorflow/tfjs';

export function getLayerResolver() {
  return {
    parameters: (layer: tf.layers.Layer) => layer.countParams(),
  };
}
