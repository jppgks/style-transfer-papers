import React, {Component} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Card} from "antd";

import ImageUpload from './ImageUpload';


/**
 *
 * @param img: 4D-Tensor
 * @returns {*}
 * Adapted from https://thekevinscott.com/image-classification-with-javascript/
 */
function cropImage(img) {
  const width = img.shape[1];
  const height = img.shape[2];

  // use the shorter side as the size to which we will crop
  const shorterSide = Math.min(img.shape[1], img.shape[2]);

  // calculate beginning and ending crop points
  const startingHeight = (height - shorterSide) / 2;
  const startingWidth = (width - shorterSide) / 2;
  const endingHeight = startingHeight + shorterSide;
  const endingWidth = startingWidth + shorterSide;

  // return image data cropped to those points
  return img.slice([0, startingWidth, startingHeight, 0], [-1, endingWidth, endingHeight, -1]);
}

class ContentLossRandomImage extends Component {
  constructor(props) {
    super(props);
    this.predictRandomImage = this.predictRandomImage.bind(this);
    this.getContentLoss = this.getContentLoss.bind(this);
    this.optimizeContentLoss = this.optimizeContentLoss.bind(this);
    this.optimizeInputImage = this.optimizeInputImage.bind(this);
    this.setInputImage = this.setInputImage.bind(this);
    this.state = {
      inputImage: undefined
    };

  }

  generateRandomInputImage() {
    let imageData = new ImageData(224, 224);

    // Fill image with 'color wheel'-like data
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Percentage in the x direction, times 255
      let x = (i % (224 * 4)) / (224 * 4) * 255;
      // Percentage in the y direction, times 255
      let y = Math.ceil(i / (224 * 4)) / 100 * 255;

      // Modify pixel data
      imageData.data[i] = x; // R value
      imageData.data[i + 1] = y; // G value
      imageData.data[i + 2] = 255 - x; // B value
      imageData.data[i + 3] = 255; // A value
    }

    // Return 4D Tensor (batch, )
    return tf.expandDims(tf.fromPixels(imageData));
  }

  predictRandomImage() {
    // Check that calling model works, perhaps also try to get layer output now
    let randomImage = this.generateRandomInputImage();
    randomImage.print(true); // verbose print
    this.props.model.predict(randomImage, {batchSize: 1}).print();
    randomImage.dispose();
  }

  getContentLoss(generatedImage, activationOriginalImage, layerName) {
    let activationGeneratedImage = this.getActivationMatrix(generatedImage, layerName);
    return activationGeneratedImage.squaredDifference(activationOriginalImage).sum().mul(0.5);
  }

  optimizeContentLoss(originalImage, layerName) {
    // White noise image to optimize
    let generatedImage = tf.randomUniform(originalImage.shape, -1, 1).variable();

    // Paint generated image to canvas.
    const canvas = document.getElementById('generated-img');
    tf.toPixels(
      tf.squeeze(generatedImage).clipByValue(0, 1)
        .mul(tf.scalar(255))
        .cast('int32'),
      canvas);

    // activation of original image is constant, so compute it once
    let activationOriginalImage = this.getActivationMatrix(originalImage, layerName);
    let contentLoss = () => this.getContentLoss(generatedImage, activationOriginalImage, layerName);
    // define optimizer
    let optimizer = tf.train.adam();
    console.log('Start optimizing content loss.');
    for (let i = 0; i < 100; i++) {
      console.log(`Iteration ${i}`);
      //  optimize contentLoss wrt generatedImage
      optimizer.minimize(() => contentLoss(), true, [generatedImage]); // , returnCost = true, varList = ?

      // if state.stopButtonPressed: break
    }

    // visualize result
    tf.toPixels(
      tf.squeeze(generatedImage).clipByValue(0, 1)
        .mul(tf.scalar(255))
        .cast('int32'),
      canvas);
  }

  optimizeInputImage() {
    let image = this.state.inputImage;
    this.optimizeContentLoss(image, 'block1_conv1');
  }

  /**
   * Set this.state.inputImage to 4D image as input to VGG network.
   *
   * @param image: Image object
   */
  setInputImage(image) {
    let imageTensor = tf.expandDims(tf.fromPixels(image));
    imageTensor = cropImage(imageTensor);
    imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
    this.setState({
      inputImage: imageTensor
    });
  }

  /**
   * Returns Tensor of shape (batchSize, M_l, N_l) where
   * M_l = width * height of the given input image and
   * N_l = the number of filters at layer layerName.
   *
   * @param image
   * @param layerName
   * @returns {*|void}
   */
  getActivationMatrix(image, layerName) {
    let layer = this.props.model.getLayer(layerName);
    let layerShape = layer.outputShape;

    let finalIndex = layer.id;
    // let inputs = image;
    let currentActivation = image;
    for (let i = 1; i <= finalIndex; i++) {
      let currentLayer = this.props.model.getLayer(null, i);
      currentActivation = currentLayer.apply(currentActivation);
      // inputs = currentActivation;
    }
    let activationShape = currentActivation.shape;
    return currentActivation.reshape([activationShape[0], activationShape[1]*activationShape[2], layerShape[3]]);
  }

  render() {
    return (<div>
      <ImageUpload imageSetter={this.setInputImage} />
      <Button onClick={this.optimizeInputImage}>Optimize</Button>
      <Card style={{width: 224}}
            cover={<canvas width={224} height={224} id="generated-img"/>}>
        Generated image
      </Card>
    </div>);
  }
}

export default ContentLossRandomImage;
