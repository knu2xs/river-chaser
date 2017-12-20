import DS from 'ember-data';
import Ember from 'ember';
const uidField = 'reachId';

const normalizeRecord = (record) => {

  return {
      type: "reaches",
      id: record.attributes[uidField],
      attributes: record.attributes
    }

};

export default DS.JSONAPISerializer.extend({

  keyForAttribute: (attr) => {
    return Ember.String.camelize(attr);
  },

  normalizeResponse (store, primaryModelClass, payload, id, requestType) {
    payload = {
      data: payload
    };
    return this._super(store, primaryModelClass, payload, id, requestType);
  },

  normalizeSingleResponse (store, primaryModelClass, payload, id, requestType) {
    payload = {
      data: payload.data[0]
    };
    return this._super(store, primaryModelClass, payload, id, requestType);
  }

});
