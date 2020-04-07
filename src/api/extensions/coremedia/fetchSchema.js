/**
 * This script loads the latest schema definitions from the headless server and stores them in the project.
 * This is required for the Fragment Introspection of Apollo.
 * If the schema of the server changes, simply rerun this script and commit the changed fragmentTypes.json.
 */

const fetch = require('node-fetch');
const fs = require('fs');

// Ignore all certificate warnings because we are really dirty hacking this!
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

let host = process.env.HOST;
if (host === undefined) {
  host = 'headless-server-preview-mz.cloud.coremedia.io';
}
const endpointUrl = 'https://' + host;

fetch(`${endpointUrl}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `
  })
})
  .then(result => result.json())
  .then(result => {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null
    );
    result.data.__schema.types = filteredData;
    fs.writeFile('./fragmentTypes.json', JSON.stringify(result.data), err => {
      if (err) {
        console.error('Error writing fragmentTypes file', err);
      } else {
        console.log('Fragment types successfully extracted!');
      }
    });
  });
