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
        layers: [Layer]
    }
  
    type Layer {
        name: String,
        id: Int,
        trainable: Boolean,
        outputShape: [Int],
        parameters: Int
    }
    
    input TensorIn {
        shape: [Int],
        dtype: String,
        values: [Float]
    }
  
    type Tensor {
        shape: [Int],
        dtype: String,
        values: [Float]
    }
`;

module.exports = typeDefs;
