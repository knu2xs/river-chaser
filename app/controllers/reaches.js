import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  // linking the url to the query params in the field
  queryParams: ['search'],
  search: '',

  // sort the reaches so they appear in logical order
  sortFields: ['riverName:asc', 'name:asc'],
  modelSorted: computed.sort('model', 'sortFields'),

  actions: {

    // this prevents pressing enter from submitting and reloading the page
    preventSubmit(evt) {
      evt.preventDefault();
      return false;
    },

  }

});
