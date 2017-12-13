import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  // properties direct from the returned values
  reachId: DS.attr('string'),
  name: DS.attr('string'),
  riverName: DS.attr('string'),
  riverAlternateName: DS.attr('string'),
  error: DS.attr('boolean'),
  notes: DS.attr('string'),
  abstract: DS.attr('string'),
  difficulty: DS.attr('string'),
  difficultyMinimum: DS.attr('string'),
  difficultyMaximum: DS.attr('string'),
  difficultyOutlier: DS.attr('string'),
  dateUpdateAw: DS.attr('date'),
  description: DS.attr('string'),
  navPutinX: DS.attr('number'),
  navPutinY: DS.attr('number'),
  navTakeoutX: DS.attr('number'),
  navTakeoutY: DS.attr('number'),

  // computed properties
  description100: computed('description', function() {
    return this.get('description').split(' ').splice(0,100).join(' ') + '...';
  }),
  showDescription100: computed('description', function() {
    return (this.get('description').split(' ').length >= 100);
  }),
  showDetails: computed('description', 'abstract', function(){
    return this.showDescription100 || this.abstract.length;
  }),
  navShuttle: computed('navPutinX', 'navPutinY', 'navTakeoutX', 'navTakeoutY', function(){
    return `http://maps.google.com/maps?daddr=${this.get('navTakeoutY')},${this.get('navTakeoutX')}&saddr=${this.get('navPutinY')},${this.get('navPutinX')}`
  }),
  navPutin: computed('navPutinX', 'navPutinY', function(){
    return `http://maps.google.com/maps?daddr=${this.get('navTakeoutY')},${this.get('navTakeoutX')}&saddr=Current%20Location`
  }),
  navTakeout: computed('navTakeoutX', 'navTakeoutY', function(){
    return `http://maps.google.com/maps?daddr=${this.get('navPutinY')},${this.get('navPutinX')}&saddr=Current%20Location`
  })

});
