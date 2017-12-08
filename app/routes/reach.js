import Route from '@ember/routing/route';
import { computed } from '@ember/object';

export default Route.extend({

  model(params){
    return this.get('store').findRecord('reach', params.reachId);
  }

});
