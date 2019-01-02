const env = process.env.NODE_ENV;

const development = {
  model: {
    host: '127.0.0.1:8080' // local copy of model served by `http-server --cors`
  }
};

const production = {
  model: {
    host: 'raw.githubusercontent.com/jppgks/vgg19-tensorflowjs-model/master/model'
  }
};

const config = {
  development,
  production
};

module.exports = config[env];