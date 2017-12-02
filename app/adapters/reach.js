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
  request(`${urlFeatureLayer}?f=json`, {method: 'GET'})
  .then((respProp) => {
    Ember.debug(`Max Record Count: ${respProp.maxRecordCount}`);

    // get the feature count
    makeQueryRequest({returnCountOnly: true})
    .then((respCnt) => {
      Ember.debug(`Feature Count: ${respCnt.count}`);

      // calculate the number of pulls required to get all the data
      let pullCount = Math.ceil(respCnt.count / respProp.maxRecordCount);
      Ember.debug(`Pull Count: ${pullCount}`);

      // iteratively, in chunks, retrieve all the features
      let allFeatures = [];
      for (let i = 0; i < pullCount; i++){
        let offset = i * respProp.maxRecordCount;
        let recordCount = respProp.maxRecordCount;
        allFeatures.push(makeQueryRequest({
          resultOffset: offset,
          resultRecordCount: recordCount
        }));
      }

      // catcher to get all the promises and send back the results
      Promise.all(allFeatures).then((allFeatures) => {
        return allFeatures;
      });

    });

  });

}

export default DS.JSONAPIAdapter.extend({

  findAll: function(store) {

    return retrieveAll();

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
