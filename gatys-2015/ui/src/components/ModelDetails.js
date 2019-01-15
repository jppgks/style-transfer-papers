import React, {Component} from 'react';

import {Button, Row, Table} from "antd";
import {Query} from "react-apollo";
import gql from "graphql-tag";

function formatShape(shape) {
  const oShape = shape.slice();
  if (oShape.length === 0) {
    return 'Scalar';
  }
  if (oShape[0] === null) {
    oShape[0] = 'batch';
  }
  return `[${oShape.join(',')}]`;
}

/*
 * Gets summary information/metadata about a layer.
 */
function getLayerSummary(layer) {
  let outputShape;
  if (Array.isArray(layer.outputShape[0])) {
    const shapes = (layer.outputShape).map(s => formatShape(s));
    outputShape = `[${shapes.join(', ')}]`;
  } else {
    outputShape = formatShape(layer.outputShape);
  }

  return {
    name: layer.name,
    trainable: layer.trainable,
    parameters: layer.parameters,
    index: layer.id,
    outputShape,
  };
}

const GET_LAYERS = gql`
    {
        model {
            layers {
                name,
                id,
                trainable,
                outputShape,
                parameters
            }
        }
    }
`;


class ModelDetails extends Component {
  constructor(props) {
    super(props);

    this.getDataSource = this.getDataSource.bind(this);
    this.toggleTable = this.toggleTable.bind(this);

    this.state = {
      layers: undefined,
      showTable: false
    }
  }

  static getColumns() {
    return [
      {
        title: 'Key', dataIndex: 'key', key: 'key',
        width: 100,
        sorter: (a, b) => a.key - b.key,
      },
      {
        title: 'Index in model', dataIndex: 'index', key: 'index',
        width: 100,
        sorter: (a, b) => a.key - b.key,
      },
      {
        title: 'Layer Name', dataIndex: 'layerName', key: 'layerName',
        width: 200,
        filters: [{text: 'Trainable', value: 'Trainable'}],
        onFilter: (value, record) => value === 'Trainable' ? record.trainable : true,
      },
      {
        title: 'Output Shape', dataIndex: 'outputShape', key: 'outputShape',
        width: 300,
      },
      {
        title: '# Of Params', dataIndex: 'numParams', key: 'numParams',
        sorter: (a, b) => a.numParams - b.numParams,
      }
    ];
  }

  getDataSource(layers) {
    const summary = {
      layers: layers,
    };

    let rowId = 1;

    return summary.layers.map(
      l => {
        return {
          'key': rowId++,
          'index': l.id,
          'layerName': l.name,
          'outputShape': l.outputShape,
          'numParams': l.parameters,
          'trainable': l.trainable,
        }
      });
  }

  toggleTable() {
    this.setState({showTable: !this.state.showTable});
  }

  render() {
    return (
      <Query query={GET_LAYERS}>
        {({loading, error, data}) => {
          if (loading) return null;
          // TODO: catch errors gracefully
          const layers = data.model.layers;
          return (
            <div>
              <Row style={{marginBottom: 10}}>
                <h3>Model Details</h3>
                <Button onClick={this.toggleTable}>Model summary</Button>
              </Row>
              <Row>
                {this.state.showTable &&
                <Table columns={ModelDetails.getColumns()} dataSource={this.getDataSource(layers)}
                       size={'small'}
                       pagination={{pageSize: 50, position: 'none'}} scroll={{y: 250}}
                       footer={() => <span><a
                         href='https://github.com/DavidCai1993/vgg19-tensorflowjs-model'>VGG model</a> exported for TF.js by David Cai.</span>}
                />
                }
              </Row>
            </div>
          )
        }}
      </Query>
    );
  }
}

export default ModelDetails;
