import '@tensorflow/tfjs-node';
import * as tf from '@tensorflow/tfjs';
import {ApolloServer} from "apollo-server-express";
import {getQueryResolver} from "./resolvers/Query";
import {getLayerResolver} from "./resolvers/Layer";
import express = require('express');
import cors = require('cors');
import * as bodyParser from "body-parser";

const config = require('./config');
const typeDefs = require('./schema');

async function run() {
  let vggModel: tf.Model = await tf.loadModel(
    `${config.model.host}/model.json`);

  let Query = getQueryResolver(vggModel);
  let Layer = getLayerResolver();
  const resolvers = {
    Query,
    Layer
  };

  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 500000 }));
  app.use(bodyParser.json({ limit: '50mb' }));
  const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    playground: {
      settings: {
        "request.credentials": "same-origin"
      }
    }
  });
  server.applyMiddleware({app});

  app.listen({port: 4000}, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

run();
