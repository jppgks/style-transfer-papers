const env = process.env.NODE_ENV;

const development = {
  model: {
    host: 'http://127.0.0.1:8080' // local copy of model served by `http-server --cors`
  },
  api: {
    uri: 'http://localhost:9000/graphql'
  }
};

const production = {
  model: {
    host: 'https://raw.githubusercontent.com/jppgks/vgg19-tensorflowjs-model/master/model'
  },
  api: {
    uri: 'ADD_NETLIFY_URI_TO_GRAPHQL_API'
  }
};

const config = {
  development,
  production
};

module.exports = config[env];