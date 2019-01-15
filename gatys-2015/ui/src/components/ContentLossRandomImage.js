import React, {Component} from "react";
import * as tf from '@tensorflow/tfjs';
import {Button, Card} from "antd";
import ImageUpload from './ImageUpload';
import {fetchQuery, graphql} from "react-relay";

const assert = require('assert');

const environment = require('../environment');

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

const GET_OPTIMIZED_IMAGE = graphql`
    query ContentLossRandomImageQuery($originalImage: [Float],
    $originalShape: [Int],
    $generatedImage: [Float],
    $generatedShape: [Int],
    $layerName: String,
    $steps: Int) {
        optimizeContentLoss(originalImage: $originalImage,
            originalShape: $originalShape,
            generatedImage: $generatedImage,
            generatedShape: $generatedShape,
            layerName: $layerName,
            steps: $steps) {
            shape
            dtype
            values
        }
    }
`;

class ContentLossRandomImage extends Component {
  constructor(props) {
    super(props);
    this.optimizeInputImage = this.optimizeInputImage.bind(this);
    this.setInputImage = this.setInputImage.bind(this);
    this.state = {
      inputImage: null
    };

  }

  //   // visualize result: TODO: return through GraphQL subscription
  //   tf.toPixels(
  //     tf.squeeze(generatedImage).clipByValue(0, 1)
  //       .mul(tf.scalar(255))
  //       .cast('int32'),
  //     canvas);
  // }

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

  computeQueryVars() {
    const layerName = "block1_conv1";
    const steps = 1000;
    const originalImage = Object.values(this.state.inputImage.dataSync());
    // console.debug(originalImage);
    const originalShape = this.state.inputImage.shape;
    // White noise image to optimize
    const generatedImage = Object.values(tf.randomUniform(originalShape, -1, 1).variable().dataSync());
    const generatedShape = originalShape;
    return {originalImage, originalShape, generatedImage, generatedShape, layerName, steps};
  }

  optimizeInputImage() {
    assert(this.state.inputImage);
    fetchQuery(environment, GET_OPTIMIZED_IMAGE, this.computeQueryVars())
      .then(data => {
        // Paint optimized image to canvas
        console.debug("Data received");
        console.debug(data);
        const canvas = document.getElementById('generated-img');
        const result = data.optimizeContentLoss;
        const pixelTensor = tf.tensor(result.values, result.shape, result.dtype);
        tf.toPixels(
          tf.squeeze(pixelTensor),
          canvas);
      })
      .catch(reason => {
        console.error("Error loading content optimized image.");
        console.error(reason);
      });
  }

  render() {
    return (<div>
      <ImageUpload imageSetter={this.setInputImage}/>
      {this.state.inputImage && <Button onClick={this.optimizeInputImage}>Optimize</Button>}
      <Card style={{width: 224}}
            cover={<canvas width={224} height={224} id="generated-img"/>}>
        Generated image
      </Card>
    </div>);
  }
}

export default ContentLossRandomImage;
