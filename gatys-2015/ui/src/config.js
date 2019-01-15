const env = process.env.NODE_ENV;

const development = {
  api: {
    uri: 'http://localhost:4000/graphql'
  }
};

const production = {
  api: {
    uri: 'ADD_NETLIFY_URI_TO_GRAPHQL_API'
  }
};

const config = {
  development,
  production
};

module.exports = config[env];