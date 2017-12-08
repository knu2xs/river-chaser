import DS from 'ember-data';
import request from '../utils/request';
import ENV from '../config/environment';
import Ember from 'ember';

const urlFeatureLayer = ENV.APP.ARCGIS.POINTS.URL;
const urlQuery = `${urlFeatureLayer}/query`;
const uidField = 'reachId';  // not the same one ArcGIS uses

// for quickly making a get request to the ArcGIS REST endpoint
const makeQueryRequest = (opts) => {
  opts.f = 'json';  // just ensuring this is taken care of

  // providing a default if none is provided
  if (!opts.where){
    opts.where = '1=1';
  }

  // using Ember's built in jQuery to parameterize inputs for request
  opts = Ember.$.param(opts);

  // combine params onto url, and make request
  let url = `${urlQuery}?${opts}`;
  return request(url, {method: 'GET'});
}

// pulling together the steps to side step the maximum record response limit
let retrieveAll = () => {

  // retrieve the maximum feature count
  // define some vars we want to access all through this chain
  let MAX_RECORD_COUNT;
  let TOTAL_RECORDS;
  return request(`${urlFeatureLayer}?f=json`, {method: 'GET'})
  .then((respProp) => {
    Ember.debug(`Max Record Count: ${respProp.maxRecordCount}`);
    MAX_RECORD_COUNT = respProp.maxRecordCount;
    // get the feature count
    return makeQueryRequest({returnCountOnly: true});
  })
  .then((respCnt) => {
    Ember.debug(`Feature Count: ${respCnt.count}`);
    TOTAL_RECORDS = respCnt.count;
    // calculate the number of pulls required to get all the data
    let pullCount = Math.ceil(TOTAL_RECORDS / MAX_RECORD_COUNT);
    Ember.debug(`Pull Count: ${pullCount}`);

    // iteratively, in chunks, retrieve all the features
    let allFeatures = [];
    for (let i = 0; i < pullCount; i++){
      let offset = i * MAX_RECORD_COUNT;
      let recordCount = MAX_RECORD_COUNT;
      allFeatures.push(makeQueryRequest({
        outFields: '*',
        returnGeometry: false,
        resultOffset: offset,
        resultRecordCount: recordCount
      }));
    }
    // We use allSettled vs all b/c all will fail if ANY request fails
    // where as allSettled will not.
    return Ember.RSVP.allSettled(allFeatures);
  })
  .then((settledPromises) => {
    // we need to extract the data our of the settled promises...
    let features = [];
    // map over the promises
    settledPromises.map((prms) => {
      // if it's state is fulfilled...
      if (prms.state === 'fulfilled') {
        // concat the features over...
        features = features.concat(prms.value.features)
      }
    });
    // return!
    return features;
  })
  .catch((err) => {
    Ember.debug(`Caught error ${err}`);
  })

}

export default DS.JSONAPIAdapter.extend({

  findAll: function(store) {
    return retrieveAll()
    .then((features) => {
      let reaches = features.map((f) => {
        return {
          type: "reaches",
          id: f.attributes['reachId'],
          attributes: f.attributes
        }
      });

      store.pushPayload('reaches', {data: reaches});
      return reaches;
    })

    // let opts = Ember.$.param({
    //   where: '1=1',
    //   f: 'json',
    //   outFields: '*'
    // });
    // let url = `${urlQuery}?${opts}`;
    // return request(url, {method: 'GET'});
  },

  findRecord (store, type, id) {
    let opts = Ember.$.param({
      where: `${uidField} = ${id}`,
      f: 'json',
      outFields: '*'
    });
    let url = `${urlQuery}?${opts}`;
    return request(url, {method: 'GET'});
  }

});
