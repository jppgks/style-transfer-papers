import '@tensorflow/tfjs-node';
import * as tf from '@tensorflow/tfjs';

/**
 * Returns Tensor of shape (batchSize, M_l, N_l) where
 * M_l = width * height of the given input image and
 * N_l = the number of filters at layer layerName.
 *
 * @param image
 * @param layerName
 * @returns {*|void}
 */
function getActivationMatrix(model: tf.Model,
                             image: tf.Tensor,
                             layerName: string): tf.Tensor {
  let layer = model.getLayer(layerName);
  let layerShape = layer.outputShape;

  let finalIndex = layer.id;
  let currentActivation: any = image;
  for (let i = 1; i <= finalIndex; i++) {
    let currentLayer = model.getLayer(null, i);
    currentActivation = currentLayer.apply(currentActivation);
  }
  let activationShape = currentActivation.shape;
  return currentActivation.reshape(
    [activationShape[0], activationShape[1]*activationShape[2], layerShape[3]]);
}

function getContentLoss(model: tf.Model,
                        generatedImage: tf.Tensor,
                        activationOriginalImage: tf.Tensor,
                        layerName: string): tf.Scalar {
  let activationGeneratedImage = getActivationMatrix(model, generatedImage, layerName);
  return activationGeneratedImage
    .squaredDifference(activationOriginalImage).sum().mul(0.5).asScalar();
}

export function getQueryResolver(model: tf.Model) {
  return {
    model: () => model,
    predict(obj: any, args: { inputs: any; }) {
      const inputs = args.inputs;
      const prediction: tf.Tensor = tf.tensor(
        inputs.values, inputs.shape, inputs.dtype);
      return prediction;
    },
    optimizeContentLoss(obj: any,
                        args: {
                          originalImage: any, originalShape: number[],
                          generatedImage: any, generatedShape: number[],
                          layerName: string, steps: number
                        }) {
      let {originalImage, originalShape, generatedImage, generatedShape,
        layerName, steps} = args;
      // console.debug(originalImage);
      originalImage = tf.tensor(
        originalImage, originalShape, 'float32');
      generatedImage = tf.tensor(
        generatedImage, generatedShape, 'float32').variable();

      // activation of original image is constant, so compute it once
      let activationOriginalImage = getActivationMatrix(
        model, originalImage, layerName);
      let contentLoss = function (): tf.Scalar {
        return getContentLoss(
          model, generatedImage, activationOriginalImage, layerName);
      };
      // define optimizer
      let optimizer = tf.train.adam();
      console.log('Start optimizing content loss.');
      for (let i = 0; i < steps; i++) {
        console.log(`Iteration ${i}`);
        //  optimize contentLoss wrt generatedImage
        optimizer.minimize(() => contentLoss(), undefined, [generatedImage]);
      }

      generatedImage = tf.squeeze(generatedImage).clipByValue(0, 1)
        .mul(tf.scalar(255))
        .cast('int32');

      return {
        shape: generatedImage.shape,
        dtype: "int32",
        values: Object.values(generatedImage.dataSync())
      };
    }
  };
}

