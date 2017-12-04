import DS from 'ember-data';
import request from '../utils/request';
import ENV from '../config/environment';
import Ember from 'ember';

const urlFeatureLayer = ENV.APP.ARCGIS.POINTS.URL;
const urlQuery = `${urlFeatureLayer}/query`;

const uidField = 'OBJECTID';

export default DS.JSONAPIAdapter.extend({

  findAll (store, type, sinceToken, snapshotRecordArray)  {
    let opts = Ember.$.param({
      where: '1=1',
      f: 'json',
      outFields: '*'
    });
    let url = `${urlQuery}?${opts}`;
    return request(url, {method: 'GET'});
  },

  // find record based on the ID field
  findRecord (store, type, id) {

    // build the url - this one is unique to Esri - almost like the REST spec!
    let url = `${urlFeatureLayer}/${id}?f=json`;

    // make the request
    return request(url, {method: 'GET'});

  },

  // query the rest endpoint
  query (store, type, query) {

    // create paramerters object
    let params = {
      where: query,
      outFields: '*',
      f: 'json'
    };

    // using Ember's built in jQuery to parameterize inputs for request
    params = Ember.$.param(params);

    // combine params onto url
    let url = `${urlQuery}?${params}`;

    // pass back the request, thankfully taking care of the promise
    return request(url, {method: 'GET'});
  }

});
