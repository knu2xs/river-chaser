import Route from '@ember/routing/route';

export default Route.extend({

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
      let query = `reachId LIKE '${searchString}%'`;
      return this.get('store').query('reach', query);

    // if however, the search IS a number
    } else {

      // don't actually search unless at least three characters
      if (searchString.length >= 3){

        // build a query searching in the river and reach name fields
        let query = `riverName LIKE '%${searchString}%' OR name LIKE '%${searchString}%' OR riverAlternateName LIKE '%${searchString}%'`;
        return this.get('store').query('reach', query);

      } else {

        // unload the search results
        return this.get('store').unloadAll();
      }

    }

  }

});
