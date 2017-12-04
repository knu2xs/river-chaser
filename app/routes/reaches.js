import Route from '@ember/routing/route';

export default Route.extend({

  queryParams: {
    search: {
      refreshModel: true
    }
  },

  model(params){
    let searchString = params.search.trim();
    let query = `riverName LIKE '%${searchString}%' OR name LIKE '%${searchString}%'`;
    if (query.length > 3){
      return this.get('store').query('reach', query);
    }
  }

});
