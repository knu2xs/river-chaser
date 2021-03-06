import Route from '@ember/routing/route';
import { computed } from '@ember/object';

// array of fields being queried
const fieldArray = ['name', 'riverName', 'riverAlternateName'];
const reachIdField = 'reachId';

// build a query statement for submitting to an ArcGIS Online
let createQuery = (queryString) => {

  // trim whitespace, remove non word characters, and split words into array
  let queryStringArray = queryString.replace(/[\W_]+/g, ' ').split(' ');

  // create all permutations of fields and words into a single array
  let queryArray = [];
  for (let i=0; i < fieldArray.length; i++) {
    let wordQueryArray =queryStringArray.map((thisQuery) => `${fieldArray[i]} LIKE '%${thisQuery}%'`);
    queryArray.push('(' + wordQueryArray.join(' AND ') + ')');
  }

  // collapse all the individual field query statements into a single statement
  return queryArray.join(' OR ');
};

export default Route.extend({

  // this ensures the url stays in sync with the search string
  queryParams: {
    search: {
      refreshModel: true
    }
  },

  model(params){

    // ensure leading and trailing spaces are not being sent as part of query
    let searchString = params.search.trim();

    // check if this is a number, not a normal string
    if (!isNaN(parseFloat(searchString)) && isFinite(searchString)) {

      // build a query to search the reachId
      let query = `${reachIdField} LIKE '${searchString}%'`
      return this.get('store').query('reach', query);

    // if however, the search IS a number
    } else {

      // don't actually search unless at least three characters
      if (searchString.length >= 3){

        // build a query searching in the river and reach name fields
        return this.get('store').query('reach', createQuery(searchString));

      } else {

        // unload the search results
        return this.get('store').unloadAll();
      }

    }

  },

  reachIdArray: computed('model', function() {
    return this.modelFor('reaches').map((record) => record.get('reachId'));
  })

});
