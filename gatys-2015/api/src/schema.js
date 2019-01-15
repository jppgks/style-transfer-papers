const {gql} = require('apollo-server-express');

const typeDefs = gql`
    type Query {
        model: Model,
        predict(inputs: TensorIn!): Tensor,
        optimizeContentLoss(
            originalImage: [Float],
            originalShape: [Int],
            generatedImage: [Float],
            generatedShape: [Int],
            layerName: String, 
            steps: Int
        ): Tensor
    }
  
    type Model {
        id: ID,
        layers: [Layer]
    }
  
    type Layer {
        id: ID,
        name: String,
        index: Int,
        trainable: Boolean,
        outputShape: [Int],
        parameters: Int
    }
    
    input TensorIn {
        id: ID,
        shape: [Int],
        dtype: String,
        values: [Float]
    }
  
    type Tensor {
        id: ID,
        shape: [Int],
        dtype: String,
        values: [Float]
    }
`;

module.exports = typeDefs;
