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
  didInsertElement: function () {

    this._super(...arguments);

    // load the esri modules
    this.get('esriLoader').loadModules(
      ['esri/views/MapView', 'esri/Map', 'esri/widgets/BasemapGallery', 'esri/widgets/LayerList',
        'esri/layers/FeatureLayer', 'esri/layers/BaseDynamicLayer', 'esri/layers/MapImageLayer',
        'esri/layers/GroupLayer', 'esri/geometry/Extent']
    ).then(modules => {

      // although I left this in...I have no freaking clue what the heck it does
      if (this.get('isDestroyed') || this.get('isDestroying')) {
        return;
      }

      const [MapView, Map, BasemapGallery, LayerList, FeatureLayer, BaseDynamicLayer, MapImageLayer,
        GroupLayer, Extent] = modules;

      // create feature layer for reach points and lines, and add them both to a group layer
      let layerReachPoints = new FeatureLayer({
        url: ENV.APP.ARCGIS.POINTS.URL,
        title: 'Reach Points',
        visible: true
      });
      let layerReachLines = new FeatureLayer({
        url: ENV.APP.ARCGIS.LINES.URL,
        title: 'Reach Lines',
        visible: false
      });
      let groupLayerReach = new GroupLayer({
        title: 'River Reaches',
        visible: false,
        visibilityMode: 'exclusive',
        layers: [
          layerReachLines,
          layerReachPoints
        ]
      });

      // create precipitation layers and create a group layer for these layers
      let layerRadar = new MapImageLayer({
        url: ENV.APP.ARCGIS.RADAR.URL,
        title: 'NOAA NEXRad Radar'
      });
      let layerQpfAmount6 = new MapImageLayer({
        url: ENV.APP.ARCGIS.QPF.AMOUNT.URL6,
        title: 'QPF Amount - 6 Hours'
      });
      let groupLayerPrecip = new GroupLayer({
        title: 'Precipitation',
        visible: false,
        visibilityMode: 'exclusive',
        layers: [
          layerQpfAmount6,
          layerRadar
        ],
        opacity: 0.5
      });

      // if a reachId is provided, apply a definition query
      if (this.get('reachId')) {
        layerReachPoints.definitionExpression = `reachId = '${this.get('reachId')}'`;
        layerReachLines.definitionExpression = `reachId = '${this.get('reachId')}'`;
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

        // zoom to the extent of the conterminous United States
        extent: new Extent({
          xmin: -125.419921875,
          ymin: 24.686952412,
          xmax: -64.355492,
          ymax: 49.4966745275
        }),

        // Meades Ranch, KS
        // center: [-98.5422, 39.2241],  // TODO: Change this to extent of conterminous so different aspect ratios render
        // zoom: 5

      });

      // once the view finishes
      this._view.then(() => {

        // create some widgets
        this._widgets = {
          basemap: new BasemapGallery({view: this._view}),
          layerList: new LayerList({view: this._view})
        };

        // provide a way to zoom to a layer
        this._zoomToLayer = (layer) => {

          // access the layerView of the layer
          this._view.whenLayerView(layer).then((layerView) => {

            // wait for the layerView ot finish updating...if it is
            layerView.watch('updating', (val) => {
              if (!val) {

                // now, get the extent of features in the layerView
                layerView.queryExtent().then((response) => {

                  // go to the extent of all the graphics in the layer mapView
                  this._view.goTo(response.extent);

                }); // close queryExtent
              } // close if(!val)
            });  // close layerView.watch
          });  // close when layerView
        };

        // if a reachId is provided
        if (this.get('reachId')) {

          this._zoomToLayer(layerReachLines);

          // now, turn on the reach points
          groupLayerReach.visible = true;
          layerReachLines.visible = true;

        } else {

          // if the user agrees to let us know their location
          if (navigator.geolocation) {

            // Get the user's current position and go there if supported
            navigator.geolocation.getCurrentPosition((position) => {

              let coordinates = position.coords;

              this._view.goTo({
                center: [coordinates.longitude, coordinates.latitude],
                zoom: 8
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

  _activeControl: null,
  _fullscreen: false,

  actions: {

    toggleWidget: function (controlName) {
      if (controlName === 'basemap' && this._activeControl !== 'basemap') {
        this._view.ui.remove(this._widgets.layerList);
        Ember.$('#btn-layerList').removeClass('btn-primary');
        Ember.$('#btn-layerList').addClass('btn-default');
        this._view.ui.add(this._widgets.basemap, {position: 'top-right'});
        Ember.$('#btn-basemap').removeClass('btn-default');
        Ember.$('#btn-basemap').addClass('btn-primary');
        this._activeControl = controlName;

      } else if (controlName === 'layerList' && this._activeControl !== 'layerList') {
        this._view.ui.remove(this._widgets.basemap);
        Ember.$('#btn-basemap').removeClass('btn-primary');
        Ember.$('#btn-basemap').addClass('btn-default');
        this._view.ui.add(this._widgets.layerList, {position: "top-right"});
        Ember.$('#btn-layerList').removeClass('btn-default');
        Ember.$('#btn-layerList').addClass('btn-primary');
        this._activeControl = controlName;

      } else {
        this._view.ui.remove(this._widgets.basemap);
        Ember.$('#btn-basemap').removeClass('btn-primary');
        Ember.$('#btn-basemap').addClass('btn-default');
        this._view.ui.remove(this._widgets.layerList);
        Ember.$('#btn-layerList').removeClass('btn-primary');
        Ember.$('#btn-layerList').addClass('btn-default');
        this._activeControl = null;
      }
    },

    mapFullscreen: function () {
      let elem = document.getElementById('esriReachView');
      if (!this._fullscreen) {
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

      // change appearance of button to reflect status
      Ember.$('#btn-icon-fullscreen').toggleClass('icon-ui-zoom-in-fixed');
      Ember.$('#btn-icon-fullscreen').toggleClass('icon-ui-zoom-out-fixed');
      Ember.$('#btn-fullscreen').toggleClass('btn-default');
      Ember.$('#btn-fullscreen').toggleClass('btn-primary');
    }

  },

  // destroy the map before this component is removed from the DOM
  willDestroyElement() {
    if (this._view) {
      delete this._view;
    }
  }
});
