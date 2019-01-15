import React, {Component} from "react";
import ReactDOM from "react-dom";
import ModelDetails from "./components/ModelDetails";
import {Col, Row} from "antd";
import "antd/dist/antd.css";

import ContentLossRandomImage from "./components/ContentLossRandomImage";

class RootComp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<div>
      <Row>
        <Col span={2}/>
        <Col span={20}>
          <div className="tfjs-example-container">
            <h1>TensorFlow.js: Style Transfer</h1>
            <h2>TK subtitle</h2>
          </div>
        </Col>
        <Col span={2}/>
      </Row>
      <Row>
        <Col span={2}/>
        <Col span={20}>
          <h3>Description</h3>
          <p>TK</p>
        </Col>
        <Col span={2}/>
      </Row>
      <Row>
        <Col span={2}/>
        <Col span={20}>
          <div>
            <ModelDetails/>
            <ContentLossRandomImage/>
          </div>
        </Col>
        <Col span={2}/>
      </Row>
    </div>)
  }
}

let App = document.getElementById("app");

ReactDOM.render(<RootComp/>, App);
