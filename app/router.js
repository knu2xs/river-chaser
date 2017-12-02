import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('reaches');
  this.route('reach', {path: '/reaches/:reachId'}, function() {
    this.route('map');
    this.route('detail');
  });
});

export default Router;
