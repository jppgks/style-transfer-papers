import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

import React, {Component} from "react";
import ReactDOM from "react-dom";
import ModelDetails from "./components/ModelDetails";

import {Col, Row, Spin, message, Button, Skeleton, Card} from "antd";
import "antd/dist/antd.css";

window.tf = tf;
window.tfvis = tfvis;

class RootComp extends Component {
  // async function initModel() {
  initModel() {
    this.setState({modelLoading: true});
    const successMessage = () => {
      message.success('Model loaded successfully.');
    };

    // Replace with host serving VGG model over HTTP, then remove model/ from project dir
    const model_host = '127.0.0.1:8080'; // 'raw.githubusercontent.com/jppgks/vgg19-tensorflowjs-model/master/model';

    tf.loadModel(`http://${model_host}/model.json`)
      .then((model) => {
        this.model = model;
        this.setState({modelLoaded: true, modelLoading: false});
        // Show toast.
        successMessage();
        console.debug("Model loaded.");
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      modelLoading: false,
      modelLoaded: false
    };
    this.initModel = this.initModel.bind(this);
    this.predictRandomImage = this.predictRandomImage.bind(this);
  }

  generateRandomInputImage() {
    let imageData = new ImageData(224, 224);

    // Fill image with 'color wheel'-like data
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Percentage in the x direction, times 255
      let x = (i % (224*4)) / (224*4) * 255;
      // Percentage in the y direction, times 255
      let y = Math.ceil(i / (224*4)) / 100 * 255;

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
    this.model.predict(randomImage, {batchSize: 1}).print();
    randomImage.dispose();
  }

  loadButtonText() {
    let text = "loadButtonText";
    if (!this.state.modelLoaded) {
      if (this.state.modelLoading) {
        text = "Loading model";
      } else {
        text = "Load model";
      }
    } else {
      text = "Model loaded"
    }
    return text;
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={2}></Col>
          <Col span={20}>
            <div className="tfjs-example-container">
              <h1>TensorFlow.js: Style Transfer</h1>
              <h2>TK subtitle</h2>
            </div>
          </Col>
          <Col span={2}></Col>
        </Row>
        <Row>
          <Col span={2}></Col>
          <Col span={20}>
            <h3>Description</h3>
            <p>TK</p>
          </Col>
          <Col span={2}></Col>
        </Row>
        <Row>
          <Col span={2}></Col>
          <Col span={20}>
            <p>
              Click the button to load the VGG-19 model into memory,
              so we can use it to perform style transfer.
            </p>
            <Button type={"primary"} onClick={this.initModel}
                    loading={this.state.modelLoading} disabled={this.state.modelLoaded}>
              {this.loadButtonText()}
            </Button>
            {this.state.modelLoading &&
              <Skeleton loading={!this.state.modelLoaded} active title paragraph={{rows: 1}} />
            }
            {this.state.modelLoaded && (
              <div>
                <ModelDetails model={this.model}/>
                <Button onClick={this.predictRandomImage}>Log prediction of random image</Button>
                <Card style={{ width: 224 }}
                      cover={<canvas width={224} height={224} id="random-input-img"/>}>
                  Random input image
                </Card>
              </div>
            )}
          </Col>
          <Col span={2}></Col>
        </Row>
      </div>)
  }
}

let App = document.getElementById("app");

ReactDOM.render(<RootComp/>, App);

