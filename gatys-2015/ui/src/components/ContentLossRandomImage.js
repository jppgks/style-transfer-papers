import React, {Component} from "react";
import * as tf from '@tensorflow/tfjs';
import {Card} from "antd";

import ImageUpload from './ImageUpload';
import {Query} from "react-apollo";
import gql from "graphql-tag";

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

// function generateRandomInputImage() {
//   let imageData = new ImageData(224, 224);
//
//   // Fill image with 'color wheel'-like data
//   for (let i = 0; i < imageData.data.length; i += 4) {
//     // Percentage in the x direction, times 255
//     let x = (i % (224 * 4)) / (224 * 4) * 255;
//     // Percentage in the y direction, times 255
//     let y = Math.ceil(i / (224 * 4)) / 100 * 255;
//
//     // Modify pixel data
//     imageData.data[i] = x; // R value
//     imageData.data[i + 1] = y; // G value
//     imageData.data[i + 2] = 255 - x; // B value
//     imageData.data[i + 3] = 255; // A value
//   }
//
//   // Return 4D Tensor (batch, )
//   return tf.expandDims(tf.fromPixels(imageData));
// }

const GET_OPTIMIZED_IMAGE = gql`
    query GetOptimizedImage($originalImage: [Float],
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
    // this.predictRandomImage = this.predictRandomImage.bind(this);
    // this.getContentLoss = this.getContentLoss.bind(this);
    // this.optimizeContentLoss = this.optimizeContentLoss.bind(this);
    // this.optimizeInputImage = this.optimizeInputImage.bind(this);
    this.setInputImage = this.setInputImage.bind(this);
    this.state = {
      inputImage: null
    };

  }

  // predictRandomImage() {
  //   // Check that calling model works, perhaps also try to get layer output now
  //   let randomImage = generateRandomInputImage();
  //   randomImage.print(true); // verbose print
  //   this.props.model.predict(randomImage, {batchSize: 1}).print();
  //   randomImage.dispose();
  // }

  // optimizeContentLoss(originalImage, layerName) {
  //   // White noise image to optimize
  //   let generatedImage = tf.randomUniform(originalImage.shape, -1, 1).variable();
  //
  //   // Paint generated image to canvas.
  //   const canvas = document.getElementById('generated-img');
  //   tf.toPixels(
  //     tf.squeeze(generatedImage).clipByValue(0, 1)
  //       .mul(tf.scalar(255))
  //       .cast('int32'),
  //     canvas);
  //
  //   // TODO: make GraphQL query field
  //   // API: `optimizeContentLoss(originalImage, generatedImage, layerName, steps)`
  //   // returning optimized image
  //
  //   // visualize result: TODO: return through GraphQL subscription
  //   tf.toPixels(
  //     tf.squeeze(generatedImage).clipByValue(0, 1)
  //       .mul(tf.scalar(255))
  //       .cast('int32'),
  //     canvas);
  // }
  //
  // optimizeInputImage() {
  //   let image = this.state.inputImage;
  //   this.optimizeContentLoss(image, 'block1_conv1');
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
    const steps = 10;
    const originalImage = Object.values(this.state.inputImage.dataSync());
    // console.debug(originalImage);
    const originalShape = this.state.inputImage.shape;
    // White noise image to optimize
    const generatedImage = Object.values(tf.randomUniform(originalShape, -1, 1).variable().dataSync());
    const generatedShape = originalShape;
    return {originalImage, originalShape, generatedImage, generatedShape, layerName, steps};
  }

  render() {
    return (<div>
      <ImageUpload imageSetter={this.setInputImage}/>
      {/*<Button onClick={this.optimizeInputImage}>Optimize</Button>*/}
      <Card style={{width: 224}}
            cover={<canvas width={224} height={224} id="generated-img"/>}>
        Generated image
      </Card>
      {this.state.inputImage &&
      <Query query={GET_OPTIMIZED_IMAGE}
             variables={this.computeQueryVars()}>
        {({loading, error, data}) => {
          if (loading) {
            console.debug("Loading...");
            return null;
          }

          if (error) {
            console.debug("Error");
            console.error(error);
          }

          // Paint optimized image to canvas
          console.debug("Data received");
          console.debug(data);
          const canvas = document.getElementById('generated-img');
          const result = data.optimizeContentLoss;
          const pixelTensor = tf.tensor(result.values, result.shape, result.dtype);
          tf.toPixels(
            tf.squeeze(pixelTensor),
            canvas);

          return null;
        }}
      </Query>
      }
    </div>);
  }
}

export default ContentLossRandomImage;
