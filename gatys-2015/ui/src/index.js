import React, {Component} from "react";
import ReactDOM from "react-dom";
import ModelDetails from "./components/ModelDetails";
import {Col, Row} from "antd";
import "antd/dist/antd.css";

import ApolloClient from "apollo-boost";
import {ApolloProvider} from "react-apollo";
import ContentLossRandomImage from "./components/ContentLossRandomImage";

const config = require('./config');
//
// const typeDefs = `
//   type Query {
//       model: Model,
//       predict(inputs: Tensor!): Tensor,
//       optimizeContentLoss(
//           originalImage: Tensor, generatedImage: Tensor,
//           layerName: String, steps: Int
//       ): Tensor
//   }
//
//   type Model {
//       layers: [Layer]
//   }
//
//   type Layer {
//       name: String,
//       id: Int,
//       trainable: Boolean,
//       outputShape: [Int],
//       parameters: Int
//   }
//
//   type Tensor {
//       shape: [Int],
//       dtype: String,
//       values: [Float]
//   }
// `;

const client = new ApolloClient({
  uri: config.api.uri
  // clientState: {typeDefs}
});

class RootComp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ApolloProvider client={client}>
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
      </ApolloProvider>)
  }
}

let App = document.getElementById("app");

ReactDOM.render(<RootComp/>, App);
