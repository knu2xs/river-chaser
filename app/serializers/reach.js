import DS from 'ember-data';
import Ember from 'ember';

// TODO: move this into either a environment property, or, better yet, intro
// a sesssion property set at load
const uidField = 'OBJECTID';

const normalizeRecord = (record) => {

  return {
    type: "reaches",
    id: record.attributes[uidField],
    "attributes": record.attributes
  };

};

export default DS.JSONAPISerializer.extend({

  keyForAttribute: (attr) => {
    return Ember.String.camelize(attr);
  },

  normalizeResponse (store, primaryModelClass, payload, id, requestType) {

    Ember.debug('Searializer: normalizeResponse');

    console.log(payload);

    if(payload.features){
      payload = {
        data: payload.features.map((record) => normalizeRecord(record))
      };
    } else if (payload.feature) {
      payload =  {
        data: normalizeRecord(payload.feature)
      };
    } else {
      Ember.debug('No feature or features key found in response.');
    }

    return this._super(store, primaryModelClass, payload, id, requestType);
  }

});
