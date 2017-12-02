import DS from 'ember-data';
import request from '../utils/request';
import ENV from '../config/environment';
import Ember from 'ember';

const urlFeatureLayer = ENV.APP.ARCGIS.POINTS.URL;
const urlQuery = `${urlFeatureLayer}/query`;

const uidField = 'reachId';

export default DS.JSONAPIAdapter.extend({

  findAll: function(store) {
    let opts = Ember.$.param({
      where: '1=1',
      f: 'json',
      outFields: '*'
    });
    let url = `${urlQuery}?${opts}`;
    return request(url, {method: 'GET'});
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
