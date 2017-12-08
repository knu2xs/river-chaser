import Component from '@ember/component';
import Ember from 'ember';
import ENV from '../config/environment';

export default Component.extend({

  classNames: ['scene-view'],

  esriLoader: Ember.inject.service('esri-loader'),

  _mapDivId: 'esriView',

  // TODO: Create custom list of basemaps

  // TODO: Publish and add both vector tile and feature services for reaches

  // once we have a DOM node to attach the map to...
  didInsertElement() {

    this._super(...arguments);

    // load the esri modules
    this.get('esriLoader').loadModules(
      ['esri/views/MapView', 'esri/Map', 'esri/widgets/BasemapGallery', 'esri/widgets/LayerList',
        'esri/layers/FeatureLayer', 'esri/layers/MapImageLayer', 'esri/layers/GroupLayer']
    ).then(modules => {

      if (this.get('isDestroyed') || this.get('isDestroying')) {
        return;
      }

      const [MapView, Map, BasemapGallery, LayerList, FeatureLayer, MapImageLayer, GroupLayer] = modules;

      // create feature layer for reach points and lines, and add them both to a group layer
      let layerReachPoints = new FeatureLayer({
        url: ENV.APP.ARCGIS.POINTS.URL,
        title: 'Reach Points',
        visible: true
      });
      let groupLayerReach = new GroupLayer({
        title: 'River Reaches',
        visible: false,
        visibilityMode: 'exclusive',
        layers: [
          layerReachPoints
        ]
      });

      // create precipitation layers and create a group layer for these layers
      let layerRadar = new MapImageLayer({
        url: ENV.APP.ARCGIS.RADAR.URL,
        title: 'NOAA NEXRad Radar'
      });
      let groupLayerPrecip = new GroupLayer({
        title: "Precipitation",
        visible: false,
        visibilityMode: "exclusive",
        layers: [layerRadar],
        opacity: 0.75
      });

      // if a reachId is provided, apply a definition query
      if (this.get('reachId')) {
        layerReachPoints.definitionExpression = `reachId = '${this.get('reachId')}'`;
      }

      // create a map object
      this.map = new Map({
        basemap: 'dark-gray',
        layers: [
          groupLayerPrecip,
          groupLayerReach
        ]
      });

      // create a new map view centered on the conterminous United States by default
      this._view = new MapView({

        map: this.map,

        // DOM div id
        container: this._mapDivId,

        // Meades Ranch, KS
        center: [-98.5422, 39.2241],  // TODO: Change this to extent of conterminous so different aspect ratios render
        zoom: 5

      });

      // once the view finishes
      this._view.then(() => {

        // create some widgets
        this._basemapWidget = new BasemapGallery({
          view: this._view
        });
        this._layerlistWidget = new LayerList({
          view: this._view
        });

        // if a reachId is provided
        if (this.get('reachId')) {

          // TODO: get location from browser
          // for right now, use the coordinates of Olympia as the zoomto location
          let X = -122.9007;
          let Y = 47.0379;
          this._view.goTo({
            center: [X, Y],
            zoom: 8,
            easing: 'in-out-expo'
          });

          // now, turn on the reach points
          groupLayerReach.visible = true;

        } else {

          // if the user agrees to let us know their location
          if (navigator.geolocation) {

            // Get the user's current position and go there if supported
            navigator.geolocation.getCurrentPosition((position) => {

              let coordinates = position.coords;

              this._view.goTo({
                center: [coordinates.longitude, coordinates.latitude],
                zoom: 8,
                easing: 'in-out-expo'
              });

              // now, turn on the reach points
              groupLayerReach.visible = true;

            });

          } else {

            // now, turn on the reach points
            groupLayerReach.visible = true;

          }
        }

      });
    });
  },

  _basemapWidgetVisible: false,
  _layerlistWidgetVisible: false,
  _fullscreen: false,

  _removeBasemapWidget: function () {
    this._view.ui.remove(this._basemapWidget);
    this._basemapWidgetVisible = false;
  },
  _removeLayerlistWidget: function () {
    this._view.ui.remove(this._layerlistWidget);
    this._layerlistWidgetVisible = false;
  },

  actions: {

    toggleBasemap: function () {
      if (!this._basemapWidgetVisible) {
        this._removeLayerlistWidget();
        this._view.ui.add(this._basemapWidget, {
          position: 'top-right'
        });
        this._basemapWidgetVisible = true;
      } else {
        this._removeBasemapWidget();
      }
    },

    toggleLayerlist: function () {
      if (!this._layerlistWidgetVisible) {
        this._removeBasemapWidget();
        this._view.ui.add(this._layerlistWidget, {
          position: 'top-right'
        });
        this._layerlistWidgetVisible = true;
      } else {
        this._removeLayerlistWidget();
      }
    },

    mapFullscreen: function () {
      if (!this._fullscreen) {
        let elem = document.getElementById('esriReachView');
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
          this._fullscreen = true;
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
          this._fullscreen = true;
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
          this._fullscreen = true;
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
          this._fullscreen = true;
        }

      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          this._fullscreen = false;
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
          this._fullscreen = false;
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
          this._fullscreen = false;
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
          this._fullscreen = false;
        }
      }
      //TODO: change status or remove fullscreen button when in fullscreen mode
    }

  },

  // destroy the map before this component is removed from the DOM
  willDestroyElement() {
    if (this._view) {
      delete this._view;
    }
  }
});
