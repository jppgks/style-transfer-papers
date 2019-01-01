import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

import React, {Component} from "react";
import ReactDOM from "react-dom";
import ModelDetails from "./components/ModelDetails";
import PredictRandomImage from "./components/PredictRandomImage";

import {Button, Col, message, Row, Skeleton} from "antd";
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
            <Skeleton loading={!this.state.modelLoaded} active title paragraph={{rows: 1}}/>
            }
            {this.state.modelLoaded && (
              <div>
                <ModelDetails model={this.model}/>
                <PredictRandomImage model={this.model}/>
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

