import React, {Component} from "react";
import * as tf from "@tensorflow/tfjs";
import {Button, Card} from "antd";

class PredictRandomImage extends Component {
  constructor(props) {
    super(props);
    this.predictRandomImage = this.predictRandomImage.bind(this);
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

    const canvas = document.getElementById('random-input-img');
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

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

  render() {
    return (<div>
      <Button onClick={this.predictRandomImage}>Log prediction of random image</Button>
      <Card style={{width: 224}}
            cover={<canvas width={224} height={224} id="random-input-img"/>}>
        Random input image
      </Card>
    </div>);
  }
}

export default PredictRandomImage;
