import Ember from 'ember';
import fetch from 'fetch';
import addToken from './add-token';
import encodeForm from './encode-form';

/**
 * Fetch based request method
 */
export default function request (url, opts = {}) {

  // if we are POSTing, we need to manually set the content-type because AGO
  // actually does care about this header
  if (opts.method && opts.method === 'POST') {
    if (!opts.headers) {
      opts.headers = {
        'Accept': 'application/json, application/xml, multipart/form-data, text/plain, text/html, *.*',
        'Content-Type': 'multipart/form-data'
      };
    }

    // if we have a data, prep it to send
    if (opts.data) {
      opts.body = encodeForm(opts.data);
    }
  }

  opts.redirect = 'follow';
  opts.mode = 'cors';

  // add a token if provided
  url = addToken(url, opts.token);

  Ember.debug('Making request to ' + url);

  return fetch(url, opts).then(checkStatusAndParseJson);
}

/**
 * Fetch does not reject on non-200 responses, so we need to check this manually
 */
function checkStatusAndParseJson (response) {
  let error;
  Ember.debug('Fetch request status: ' + response.status);

  // check if this is one of those groovy 200-but-a-400 things
  if (response.status >= 200 && response.status < 300) {
    return response.json().then(json => {

      // cook an error
      if (json.error) {
        error = new Error(json.error.message);
        error.code = json.error.code || 404;
        error.response = response;
        Ember.debug('Error in response:  ' + json.error.message);
        throw error;

      } else {
        return json;
      }
    });

  } else {
    // Response has non 200 http code
    error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
