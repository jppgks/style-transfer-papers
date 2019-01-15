import {Environment, Network, RecordSource, Store,} from 'relay-runtime';

const config = require('./config');

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
) {
  return fetch(config.api.uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}

module.exports = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
